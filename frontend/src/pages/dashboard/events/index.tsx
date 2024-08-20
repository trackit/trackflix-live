import Grid from "./Grid";
import Timeline from "./Timeline";

export default function Events() {
  return (
    <div className="p-2">
      <Timeline />
      <hr className="mt-2" />
      <Grid />
    </div>
  );
}
