import { Types } from 'mongoose';
export interface PlayerAttributes {
    aim: number;
    gameSense: number;
    teamwork: number;
    utility: number;
    clutch: number;
    entry: number;
    support: number;
    composure: number;
    leadership: number;
    consistency: number;
}
export interface PlayerStats {
    acs: number;
    kda: number;
    adr: number;
    hsRate: number;
    kast: number;
    firstBlood: number;
    clutchRate: number;
}
export interface Player {
    id: string;
    name: string;
    chineseName: string;
    realName: string;
    age: number;
    nationality: string;
    teamId: string | null;
    position: 'Duelist' | 'Controller' | 'Initiator' | 'Sentinel';
    mainAgents: string[];
    rating: number;
    salary: number;
    stats: PlayerStats;
    attributes: PlayerAttributes;
    potential: number;
    morale: number;
    fitness: number;
    contractYears: number;
    marketValue: number;
    isFreeAgent: boolean;
    isProspect: boolean;
    achievements: string[];
}
export interface PlayerTeam {
    id: string;
    name: string;
    players: Player[];
    coach: string;
    budget: number;
    sponsors: string[];
    ranking: number;
    wins: number;
    losses: number;
    draws: number;
    chemistry: number;
    selectedTactic: {
        id: string;
        chineseName: string;
    };
    facilities: Array<{
        id: string;
        chineseName: string;
        level: number;
        maxLevel: number;
    }>;
    vctPoints: number;
    seasonWins: number;
    seasonLosses: number;
    seasonPrize: number;
    weeklyRevenue: number;
    weeklyExpense: number;
}
export interface GameState {
    playerTeam: PlayerTeam;
    allPlayers: Player[];
    currentWeek: number;
    currentSeason: number;
    gamePhase: 'preseason' | 'regular' | 'playoffs' | 'offseason';
    matchHistory: Array<{
        id: string;
        opponentName: string;
        opponentId: string;
        result: 'win' | 'loss' | 'draw';
        score: {
            team: number;
            opponent: number;
        };
        tournamentName: string;
        date: string;
        mvp: Player | null;
        tacticUsed: string;
        teamRating: number;
        opponentRating: number;
    }>;
    newsHistory: Array<{
        id: string;
        week: number;
        type: string;
        title: string;
        content: string;
        timestamp: number;
    }>;
    seasonRecords: Array<{
        season: number;
        wins: number;
        losses: number;
        vctPoints: number;
        bestFinish: string;
        prizeMoney: number;
    }>;
    vctStandings: Array<{
        teamId: string;
        teamName: string;
        region: string;
        wins: number;
        losses: number;
        points: number;
        color: string;
    }>;
    completedTournaments: string[];
}
export interface IUser {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password?: string;
    nickname?: string;
    avatar?: string;
    vctPoints: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface ISave {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    slot: number;
    name: string;
    gameState: GameState;
    isAutoSave: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IMatch {
    _id: Types.ObjectId;
    matchId: string;
    player1Id: Types.ObjectId;
    player2Id: Types.ObjectId;
    player1Name: string;
    player2Name: string;
    player1Team: PlayerTeam;
    player2Team: PlayerTeam;
    status: 'waiting' | 'ready' | 'playing' | 'finished';
    result?: {
        winnerId: string;
        team1Score: number;
        team2Score: number;
        mvpId?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
export interface JWTPayload {
    userId: string;
    username: string;
    email: string;
}
//# sourceMappingURL=index.d.ts.map