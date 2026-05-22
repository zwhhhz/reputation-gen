import { PLATFORMS, PLATFORM_LABELS, PLATFORM_COLORS } from '../lib/utils';

/**
 * 平台选择器组件
 * @param {{ value: string|null, onChange: (platform: string) => void }} props
 */
function PlatformSelect({ value, onChange }) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700">选择平台</label>
      <div className="flex space-x-3">
        {PLATFORMS.map((platform) => {
          const colors = PLATFORM_COLORS[platform];
          const isSelected = value === platform;
          return (
            <button
              key={platform}
              onClick={() => onChange(platform)}
              className={`px-5 py-2.5 rounded-lg border-2 font-medium transition-all duration-200 ${
                isSelected
                  ? colors.active + ' border-transparent shadow-md scale-105'
                  : `${colors.bg} ${colors.text} ${colors.border} hover:shadow`
              }`}
            >
              {PLATFORM_LABELS[platform]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PlatformSelect;
