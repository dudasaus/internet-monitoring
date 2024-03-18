import { program } from "commander";
import { argv } from "process";
import { readFile } from "fs";

program.version("1.0").option("-i, --input <value>", "input file").parse(argv);

const inputFile = program.opts().input;

readFile(inputFile, "utf8", (_err, data) => {
  parseLog(data);
});

function parseLog(log: string) {
  const lines = log.split("\n");
  const data = lines
    .map((line) => {
      const [status, timestamp] = line.split(",");
      if (status !== "alive" && status !== "dead") return undefined;
      return {
        status,
        timestamp: Number(timestamp),
      };
    })
    .filter((item) => item !== undefined);

  console.log(data);

  const outages: Array<{ start: number; duration: number }> = [];

  for (let i = 0; i < data.length; ++i) {
    const current = data[i]!;
    if (current.status === "alive" && i > 0) {
      const prev = data[i - 1]!;
      if (!(prev.status === "dead")) {
        throw new Error("Expected prev status to be dead");
      }
      outages.push({
        start: prev.timestamp,
        duration: current.timestamp - prev.timestamp,
      });
    }
  }

  outages.forEach((outage) => {
    const startDate = new Date(outage.start);
    const humanReadableDuration = toMinutesAndSeconds(outage.duration);
    console.log(
      "Outage",
      startDate.toLocaleString(),
      `for ${humanReadableDuration}`
    );
  });
}

function toMinutesAndSeconds(ms: number) {
  const seconds = ms / 1000;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
