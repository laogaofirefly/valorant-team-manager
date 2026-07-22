import { useGameStore } from '@/store/gameStore';
import { storyDialogs, storyChapters } from '@/data/story';
import { VCTCard, VCTButton } from '@/components/ui';
import { images } from '@/data/images';

export const StoryModal = () => {
  const { story, nextStoryDialog, closeStory } = useGameStore();

  if (!story.isActive || !story.currentChapter) return null;

  const dialogs = storyDialogs[story.currentChapter] || [];
  const currentDialog = dialogs[story.currentDialogIndex];
  const chapter = storyChapters.find(c => c.id === story.currentChapter);

  if (!currentDialog) return null;

  const isLastDialog = story.currentDialogIndex >= dialogs.length - 1;
  const isNarration = currentDialog.type === 'narration';
  const isEvent = currentDialog.type === 'event';

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.82), rgba(0,0,0,0.92)), url(${images.storyBackground})`,
        backgroundColor: '#000000',
      }}
    >
      <div className="w-full max-w-2xl">
        <div className="text-center mb-4">
          <span className="text-[10px] text-valorant-cyan font-tactical tracking-widest">
            第 {chapter?.chapterNumber} 章
          </span>
          <h2 className="font-display text-2xl font-bold text-white tracking-wider mt-1">
            {chapter?.title}
          </h2>
        </div>

        <VCTCard
          variant={isEvent ? 'highlight' : 'default'}
          corner="all"
          className={`p-6 md:p-8 ${isNarration ? 'bg-gradient-to-b from-valorant-dark to-valorant-darker' : ''}`}
        >
          {isNarration ? (
            <div className="text-center py-4">
              <div className="text-valorant-gold text-2xl mb-4">📖</div>
              <p className="text-gray-200 text-lg leading-relaxed font-tactical">
                {currentDialog.text}
              </p>
            </div>
          ) : isEvent ? (
            <div className="text-center py-4">
              <div className="text-valorant-red text-2xl mb-4 animate-pulse">📢</div>
              <p className="text-white text-lg font-bold leading-relaxed">
                「{currentDialog.text}」
              </p>
              <p className="text-valorant-gold text-sm mt-2 font-tactical">
                —— {currentDialog.speaker}
              </p>
            </div>
          ) : (
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-valorant-red to-valorant-red-dark clip-corner flex items-center justify-center border-2 border-valorant-red/50">
                  <span className="font-display text-2xl md:text-3xl font-bold text-white">
                    {currentDialog.speaker.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-valorant-cyan font-display font-bold mb-2">
                  {currentDialog.speaker}
                </p>
                <div className="relative bg-valorant-dark/60 clip-corner-sm p-4 border border-white/10">
                  <div className="absolute -left-2 top-4 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-valorant-dark/60"></div>
                  <p className="text-gray-200 leading-relaxed">
                    {currentDialog.text}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <div className="text-[10px] text-gray-500 font-tactical">
              {story.currentDialogIndex + 1} / {dialogs.length}
            </div>
            
            <div className="flex gap-2">
              <VCTButton
                variant="ghost"
                size="sm"
                onClick={closeStory}
              >
                稍后继续
              </VCTButton>
              <VCTButton
                variant="primary"
                size="sm"
                onClick={nextStoryDialog}
              >
                {isLastDialog ? '完成' : '继续 →'}
              </VCTButton>
            </div>
          </div>

          <div className="flex justify-center gap-1.5 mt-4">
            {dialogs.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === story.currentDialogIndex
                    ? 'w-6 bg-valorant-red'
                    : idx < story.currentDialogIndex
                    ? 'w-1.5 bg-valorant-teal'
                    : 'w-1.5 bg-gray-700'
                }`}
              />
            ))}
          </div>
        </VCTCard>
      </div>
    </div>
  );
};
