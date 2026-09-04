/**
 * PawLog 宠物健康日记 - Supabase 云端配置
 * 
 * 此文件已被 index.html 中的内联脚本替代
 * 保留此文件以保持兼容性（如果未来需要外部化配置）
 * 
 * 注意：Supabase 客户端在 index.html 中初始化
 */

// 导出 supabase 客户端供其他模块使用（如果需要）
if (typeof window.pawlogSupabase !== 'undefined') {
    window.supabase = window.pawlogSupabase;
}
