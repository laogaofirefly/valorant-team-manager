import mongoose, { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new Schema({
    username: {
        type: String,
        required: [true, '用户名不能为空'],
        unique: true,
        trim: true,
        minlength: [3, '用户名至少3个字符'],
        maxlength: [20, '用户名最多20个字符'],
    },
    email: {
        type: String,
        required: [true, '邮箱不能为空'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, '密码不能为空'],
        minlength: [6, '密码至少6个字符'],
    },
    nickname: {
        type: String,
        trim: true,
        default: '',
    },
    avatar: {
        type: String,
        default: '',
    },
    vctPoints: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
// 密码哈希
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password)
        return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});
// 比较密码
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password)
        return false;
    return bcrypt.compare(candidatePassword, this.password);
};
// 不返回密码
userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.password;
        return ret;
    },
});
export const User = mongoose.models.User || model('User', userSchema);
//# sourceMappingURL=User.js.map