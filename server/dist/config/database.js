import mongoose from 'mongoose';
export const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/valorant_team_manager';
    try {
        await mongoose.connect(uri);
        console.log('✅ MongoDB 连接成功');
    }
    catch (error) {
        console.error('❌ MongoDB 连接失败:', error);
        process.exit(1);
    }
};
//# sourceMappingURL=database.js.map