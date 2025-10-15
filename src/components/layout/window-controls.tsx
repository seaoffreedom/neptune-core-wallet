import { useElectronAPI } from '../../renderer/hooks/use-electron-api';
import { isMacOS } from '../../renderer/utils/platform';

/**
 * Custom window controls for Windows and Linux
 * macOS uses native traffic lights, so this component is not needed there
 */
export function WindowControls() {
  const electronAPI = useElectronAPI();

  // Don't render on macOS as it has native traffic lights
  if (isMacOS()) {
    return null;
  }

  const handleMinimize = async () => {
    try {
      await electronAPI.minimize();
    } catch (error) {
      console.error('Failed to minimize window:', error);
    }
  };

  const handleMaximize = async () => {
    try {
      await electronAPI.maximize();
    } catch (error) {
      console.error('Failed to maximize window:', error);
    }
  };

  const handleClose = async () => {
    try {
      await electronAPI.close();
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  };

  return (
    <div className="flex">
      <button
        title="Minimize"
        type="button"
        className="p-2 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        onClick={handleMinimize}
      >
        <svg
          aria-hidden="true"
          role="img"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className="text-slate-600 dark:text-slate-400"
        >
          <rect fill="currentColor" width="10" height="1" x="1" y="6"></rect>
        </svg>
      </button>
      <button
        title="Maximize"
        type="button"
        className="p-2 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        onClick={handleMaximize}
      >
        <svg
          aria-hidden="true"
          role="img"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className="text-slate-600 dark:text-slate-400"
        >
          <rect
            width="9"
            height="9"
            x="1.5"
            y="1.5"
            fill="none"
            stroke="currentColor"
          ></rect>
        </svg>
      </button>
      <button
        type="button"
        title="Close"
        className="p-2 hover:bg-red-500 hover:text-white transition-colors"
        onClick={handleClose}
      >
        <svg
          aria-hidden="true"
          role="img"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className="text-slate-600 dark:text-slate-400"
        >
          <polygon
            fill="currentColor"
            fillRule="evenodd"
            points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
          ></polygon>
        </svg>
      </button>
    </div>
  );
}
