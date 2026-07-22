import mongoose, { Schema, model } from 'mongoose';
const saveSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    slot: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    gameState: {
        type: Schema.Types.Mixed,
        required: true,
    },
    isAutoSave: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// 每个用户每个存档槽位只能有一个存档
saveSchema.index({ userId: 1, slot: 1 }, { unique: true });
export const Save = mongoose.models.Save || model('Save', saveSchema);
//# sourceMappingURL=Save.js.map