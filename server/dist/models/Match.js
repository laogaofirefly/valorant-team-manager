import mongoose, { Schema, model } from 'mongoose';
const matchSchema = new Schema({
    matchId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    player1Id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    player2Id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    player1Name: {
        type: String,
        required: true,
    },
    player2Name: {
        type: String,
        required: true,
    },
    player1Team: {
        type: Schema.Types.Mixed,
        required: true,
    },
    player2Team: {
        type: Schema.Types.Mixed,
        required: true,
    },
    status: {
        type: String,
        enum: ['waiting', 'ready', 'playing', 'finished'],
        default: 'waiting',
    },
    result: {
        winnerId: String,
        team1Score: Number,
        team2Score: Number,
        mvpId: String,
    },
}, {
    timestamps: true,
});
matchSchema.index({ status: 1, createdAt: -1 });
matchSchema.index({ player1Id: 1, status: 1 });
matchSchema.index({ player2Id: 1, status: 1 });
export const Match = mongoose.models.Match || model('Match', matchSchema);
//# sourceMappingURL=Match.js.map