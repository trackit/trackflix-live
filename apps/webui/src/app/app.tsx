import {SingleAssetFlow} from "@trackflix-live/single-asset-flow";
import {Panel, ThemeSwitcher} from "@trackflix-live/ui";

export function App() {

  return (
    <div className={'prose   '}>
      <div className={'absolute top-2 right-2'}>
        <ThemeSwitcher />
      </div>

      <div
        className={
          'flex justify-center items-center w-screen h-screen bg-base-200'
        }
      >
        <Panel>
          <h1>Trackflix Live</h1>
          <SingleAssetFlow />
        </Panel>
      </div>
    </div>
  );
}

export default App;
