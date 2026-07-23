// 图片资源统一管理
// 所有图片均通过 trae text_to_image API 生成
// API: https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt={prompt}&image_size={image_size}

const IMAGE_API_BASE = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image';

type ImageSize =
  | 'square_hd'
  | 'square'
  | 'portrait_4_3'
  | 'portrait_16_9'
  | 'landscape_4_3'
  | 'landscape_16_9';

// 构建图片URL，prompt 使用 encodeURIComponent 编码
const buildImageUrl = (prompt: string, imageSize: ImageSize): string => {
  return `${IMAGE_API_BASE}?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`;
};

// 选手位置类型，用于索引按定位生成的头像背景图
export type PlayerPosition = 'Duelist' | 'Controller' | 'Initiator' | 'Sentinel';

export const images = {
  // 1. 首页 Hero 区背景图 - VCT 电竞竞技场
  homeHeroBackground: buildImageUrl(
    'Professional esports arena stage with dramatic lighting, VALORANT VCT championship venue, dark atmosphere with red and cyan neon accents, large LED screens, gaming tournament setup, cinematic wide shot',
    'landscape_16_9'
  ),

  // 2. 战队 Logo 占位图 - 电竞战队徽章风格
  teamLogoBackground: buildImageUrl(
    'Abstract esports team logo emblem, geometric tactical design, red and dark color scheme, VALORANT style badge, modern gaming aesthetic',
    'square'
  ),

  // 3. 赛事阶段背景图
  tournamentStage: {
    // 全球冠军赛
    champions: buildImageUrl(
      'VALORANT Champions trophy on stage, golden championship cup, esports arena, dramatic spotlight, confetti celebration',
      'landscape_4_3'
    ),
    // 大师赛
    masters: buildImageUrl(
      'Esports masters tournament stage, blue and silver theme, professional gaming event, arena lights',
      'landscape_4_3'
    ),
  } as Record<'champions' | 'masters', string>,

  // 4. 转会市场装饰背景图
  marketDecoration: buildImageUrl(
    'Esports transfer market concept, player trading cards floating, contract signing scene, professional gaming team recruitment, dark red theme',
    'landscape_16_9'
  ),

  // 5. 选手卡片头像背景图 - 按角色定位区分主题
  playerPositionBackground: {
    Duelist: buildImageUrl(
      'VALORANT duelist agent silhouette, aggressive red theme, action pose background',
      'square'
    ),
    Controller: buildImageUrl(
      'VALORANT controller agent silhouette, purple smoke theme, strategic background',
      'square'
    ),
    Initiator: buildImageUrl(
      'VALORANT initiator agent silhouette, teal recon theme, tactical background',
      'square'
    ),
    Sentinel: buildImageUrl(
      'VALORANT sentinel agent silhouette, cyan defense theme, watchful background',
      'square'
    ),
  } as Record<PlayerPosition, string>,

  // 6. 剧情模式背景图
  storyBackground: buildImageUrl(
    'Dramatic esports narrative scene, team locker room strategy discussion, coach and players gathered around tactical board, cinematic lighting, emotional sports drama atmosphere',
    'portrait_16_9'
  ),

  // 7. 成就页面装饰图
  achievementsDecoration: buildImageUrl(
    'Esports achievement trophies and medals display, golden championship cups, gaming awards wall, victory celebration backdrop',
    'landscape_4_3'
  ),
} as const;
