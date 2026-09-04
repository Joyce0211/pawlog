/**
 * PawLog 宠物健康日记 - 数据存储模块
 *
 * 功能：
 * 1. 本地存储：localStorage（快速访问）
 * 2. 云端存储：Supabase（永久备份）
 * 3. 自动同步：本地操作自动同步到云端
 * 4. 离线支持：离线时使用本地数据，恢复网络后自动同步
 */

/**
 * 云端数据库操作类
 */
class CloudDatabase {
    constructor() {
        this.supabase = null;
        this.isConnected = false;
        this.syncQueue = []; // 离线操作队列
    }

    /**
     * 初始化云端连接
     */
    async init() {
        try {
            // 等待 Supabase SDK 加载
            if (typeof window.supabase === 'undefined') {
                console.log('云端存储：Supabase SDK 未加载');
                return false;
            }

            this.supabase = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            );

            // 测试连接
            const { data, error } = await this.supabase.from('pets').select('id').limit(1);

            if (error) {
                console.log('云端存储：连接失败', error.message);
                this.isConnected = false;
                return false;
            }

            console.log('云端存储：连接成功');
            this.isConnected = true;

            // 处理离线队列
            await this.processOfflineQueue();

            return true;
        } catch (e) {
            console.log('云端存储：初始化异常', e.message);
            this.isConnected = false;
            return false;
        }
    }

    /**
     * 处理离线操作队列
     */
    async processOfflineQueue() {
        if (this.syncQueue.length === 0) return;

        console.log(`云端存储：处理离线队列，共 ${this.syncQueue.length} 个操作`);

        while (this.syncQueue.length > 0) {
            const operation = this.syncQueue.shift();
            try {
                await this.executeOperation(operation);
            } catch (e) {
                console.log('离线操作执行失败:', e.message);
                // 放回队列末尾
                this.syncQueue.push(operation);
                break;
            }
        }
    }

    /**
     * 执行数据库操作
     */
    async executeOperation(operation) {
        if (!this.isConnected) {
            throw new Error('未连接到云端');
        }

        const { table, action, data, id } = operation;

        switch (action) {
            case 'insert':
                return await this.supabase.from(table).insert(data);
            case 'update':
                return await this.supabase.from(table).update(data).eq('id', id);
            case 'delete':
                return await this.supabase.from(table).delete().eq('id', id);
            case 'select':
                return await this.supabase.from(table).select('*');
            default:
                throw new Error(`未知操作: ${action}`);
        }
    }

    /**
     * 添加到离线队列
     */
    addToQueue(operation) {
        this.syncQueue.push(operation);
        localStorage.setItem('pawlog_sync_queue', JSON.stringify(this.syncQueue));
    }

    /**
     * 通用云端操作方法
     */
    async cloudOperation(table, action, data = null, id = null) {
        const operation = { table, action, data, id };

        // 如果离线，加入队列
        if (!this.isConnected) {
            console.log('离线模式：操作已加入队列', table, action);
            this.addToQueue(operation);
            return { offline: true, operation };
        }

        try {
            const result = await this.executeOperation(operation);
            return { success: true, data: result.data, error: result.error };
        } catch (e) {
            console.log('云端操作失败，加入队列重试:', e.message);
            this.addToQueue(operation);
            return { success: false, error: e.message, offline: true };
        }
    }

    /**
     * 宠物操作
     */
    async savePet(pet) {
        return await this.cloudOperation('pets', pet.id ? 'update' : 'insert', {
            id: pet.id,
            name: pet.name,
            breed: pet.breed || null,
            birthday: pet.birthday || null,
            avatar: pet.avatar || null
        }, pet.id);
    }

    async deletePet(petId) {
        // 同时删除相关的记录和支出
        await this.cloudOperation('logs', 'delete', null, petId);
        await this.cloudOperation('expenses', 'delete', null, petId);
        await this.cloudOperation('reminders', 'delete', null, petId);
        return await this.cloudOperation('pets', 'delete', null, petId);
    }

    /**
     * 健康记录操作
     */
    async saveLog(log) {
        return await this.cloudOperation('logs', log.id ? 'update' : 'insert', {
            id: log.id,
            pet_id: log.petId,
            type: log.type,
            date: log.date,
            data: log.data,
            note: log.note || null
        }, log.id);
    }

    async deleteLog(logId) {
        return await this.cloudOperation('logs', 'delete', null, logId);
    }

    /**
     * 支出记录操作
     */
    async saveExpense(expense) {
        return await this.cloudOperation('expenses', expense.id ? 'update' : 'insert', {
            id: expense.id,
            pet_id: expense.petId,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
            note: expense.note || null
        }, expense.id);
    }

    async deleteExpense(expenseId) {
        return await this.cloudOperation('expenses', 'delete', null, expenseId);
    }

    /**
     * 获取所有数据
     */
    async fetchAllData() {
        if (!this.isConnected) {
            return null;
        }

        try {
            const [pets, logs, expenses, reminders] = await Promise.all([
                this.supabase.from('pets').select('*'),
                this.supabase.from('logs').select('*'),
                this.supabase.from('expenses').select('*'),
                this.supabase.from('reminders').select('*')
            ]);

            return {
                pets: pets.data || [],
                logs: logs.data || [],
                expenses: expenses.data || [],
                reminders: reminders.data || []
            };
        } catch (e) {
            console.log('获取云端数据失败:', e.message);
            return null;
        }
    }

    /**
     * 同步本地数据到云端
     */
    async syncFromLocal() {
        const localData = loadLocalData();
        if (!localData) return;

        // 同步宠物
        for (const pet of localData.pets) {
            await this.savePet(pet);
        }

        // 同步记录
        for (const log of localData.logs) {
            await this.saveLog(log);
        }

        // 同步支出
        for (const expense of localData.expenses) {
            await this.saveExpense(expense);
        }

        console.log('本地数据已同步到云端');
    }

    /**
     * 从云端恢复数据到本地
     */
    async restoreFromCloud() {
        const cloudData = await this.fetchAllData();
        if (!cloudData) return false;

        // 转换云端数据格式为本地格式
        const localData = {
            pets: cloudData.pets.map(p => ({
                id: p.id,
                name: p.name,
                breed: p.breed,
                birthday: p.birthday,
                avatar: p.avatar
            })),
            logs: cloudData.logs.map(l => ({
                id: l.id,
                petId: l.pet_id,
                type: l.type,
                date: l.date,
                data: l.data,
                note: l.note
            })),
            expenses: cloudData.expenses.map(e => ({
                id: e.id,
                petId: e.pet_id,
                amount: e.amount,
                category: e.category,
                date: e.date,
                note: e.note
            })),
            reminders: cloudData.reminders.map(r => ({
                id: r.id,
                petId: r.pet_id,
                title: r.title,
                date: r.date,
                type: r.type,
                completed: r.completed
            })),
            settings: loadLocalData()?.settings || { themeColor: '#FF8C42', cursor: 'default', wallpaper: 'none' },
            currentPetId: cloudData.pets[0]?.id || null
        };

        saveLocalData(localData);
        console.log('云端数据已恢复到本地');
        return true;
    }
}

// 创建全局云端数据库实例
const cloudDB = new CloudDatabase();

/**
 * 从 localStorage 加载数据
 */
function loadLocalData() {
    try {
        const saved = localStorage.getItem('pawlog_data');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.log('加载本地数据失败:', e.message);
    }
    return null;
}

/**
 * 保存数据到 localStorage
 */
function saveLocalData(data) {
    try {
        localStorage.setItem('pawlog_data', JSON.stringify(data));
        return true;
    } catch (e) {
        console.log('保存本地数据失败:', e.message);
        // 可能存储空间不足，尝试清理
        if (e.name === 'QuotaExceededError') {
            console.log('存储空间不足，尝试清理...');
            cleanOldData();
            try {
                localStorage.setItem('pawlog_data', JSON.stringify(data));
                return true;
            } catch (e2) {
                console.log('清理后仍然存储失败');
                return false;
            }
        }
        return false;
    }
}

/**
 * 清理旧数据（保留最近的数据）
 */
function cleanOldData() {
    const data = loadLocalData();
    if (!data) return;

    // 保留最近100条记录
    if (data.logs && data.logs.length > 100) {
        data.logs = data.logs.slice(-100);
    }
    if (data.expenses && data.expenses.length > 100) {
        data.expenses = data.expenses.slice(-100);
    }

    saveLocalData(data);
}

/**
 * 监听网络状态变化
 */
window.addEventListener('online', async () => {
    console.log('网络已恢复');
    showToast('网络已恢复，正在同步数据...');
    await cloudDB.init();
    await cloudDB.processOfflineQueue();
});

window.addEventListener('offline', () => {
    console.log('网络已断开');
    showToast('网络已断开，数据将保存在本地');
});
