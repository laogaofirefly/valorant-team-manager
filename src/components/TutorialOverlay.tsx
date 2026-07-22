import { useGameStore } from '@/store/gameStore';
import { tutorialSteps } from '@/data/story';
import { VCTCard, VCTButton } from '@/components/ui';

interface TutorialOverlayProps {
  currentPage: string;
}

export const TutorialOverlay = ({ currentPage }: TutorialOverlayProps) => {
  const { tutorial, nextTutorialStep, prevTutorialStep, completeTutorial } = useGameStore();

  if (!tutorial.isActive || tutorial.completed) return null;

  const currentStep = tutorialSteps[tutorial.currentStep];
  if (!currentStep) return null;

  const targetPage = currentStep.targetPage;
  const isOnTargetPage = !targetPage || targetPage === currentPage;

  if (!isOnTargetPage) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
        <VCTCard variant="highlight" className="max-w-md w-full p-6 text-center">
          <div className="text-5xl mb-4">👆</div>
          <h3 className="font-display text-xl font-bold text-white mb-2">
            请先导航到{getPageName(targetPage)}页面
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            点击底部导航栏的「{getPageName(targetPage)}」继续教程
          </p>
          <VCTButton variant="secondary" onClick={completeTutorial}>
            跳过教程
          </VCTButton>
        </VCTCard>
      </div>
    );
  }

  const isCenter = currentStep.position === 'center';

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {!isCenter && <div className="absolute inset-0 bg-black/50 pointer-events-auto" />}
      
      <div className={`absolute ${getPositionClass(currentStep.position)} pointer-events-auto`}>
        <VCTCard variant="highlight" className="max-w-sm w-full p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-valorant-cyan font-tactical tracking-wider">
              教程 {tutorial.currentStep + 1}/{tutorialSteps.length}
            </span>
            <button
              onClick={completeTutorial}
              className="text-gray-500 hover:text-white text-xs font-tactical transition-colors"
            >
              跳过
            </button>
          </div>

          <h3 className="font-display text-lg font-bold text-white mb-2">
            {currentStep.title}
          </h3>
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            {currentStep.description}
          </p>

          <div className="flex items-center justify-between">
            <VCTButton
              variant="ghost"
              size="sm"
              onClick={prevTutorialStep}
              disabled={tutorial.currentStep === 0}
            >
              上一步
            </VCTButton>
            
            <div className="flex gap-1">
              {tutorialSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === tutorial.currentStep
                      ? 'bg-valorant-red'
                      : idx < tutorial.currentStep
                      ? 'bg-valorant-teal'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <VCTButton
              variant="primary"
              size="sm"
              onClick={nextTutorialStep}
            >
              {tutorial.currentStep === tutorialSteps.length - 1 ? '完成' : '下一步'}
            </VCTButton>
          </div>
        </VCTCard>
      </div>
    </div>
  );
};

const getPageName = (page?: string): string => {
  const names: Record<string, string> = {
    home: '主页',
    team: '战队',
    training: '训练',
    tournaments: '赛事',
    market: '转会',
    tactics: '战术',
    facility: '设施',
    scout: '新秀',
  };
  return names[page || ''] || '对应';
};

const getPositionClass = (position: string): string => {
  switch (position) {
    case 'top':
      return 'top-20 left-1/2 -translate-x-1/2';
    case 'bottom':
      return 'bottom-24 left-1/2 -translate-x-1/2';
    case 'center':
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    case 'left':
      return 'left-4 top-1/2 -translate-y-1/2';
    case 'right':
      return 'right-4 top-1/2 -translate-y-1/2';
    default:
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
  }
};
