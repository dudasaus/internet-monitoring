import ping from "ping";

enum PingResult {
  ALIVE,
  DEAD,
  ERROR,
}

async function checkConnectionOnce(): Promise<PingResult> {
  try {
    const result = await ping.promise.probe("8.8.8.8", {
      timeout: 5,
    });
    const { alive } = result;
    return alive ? PingResult.ALIVE : PingResult.DEAD;
  } catch (err) {
    console.error(`Timestamp: ${Date()}\n`, err);
    return PingResult.ERROR;
  }
}

async function startConnectionMonitor() {
  let run = true;
  let lastResult: PingResult | undefined = undefined;

  process.on("SIGABRT", () => {
    run = false;
    if (lastResult) logResult(lastResult);
    console.log("Exiting");
  });

  do {
    const start = performance.now();
    const result = await checkConnectionOnce();
    if (result !== lastResult) {
      logResult(result);
    }
    lastResult = result;
    let duration = performance.now() - start;
    if (duration < 10 * 1000) {
      await wait(10 * 1000 - duration);
    }
  } while (run);
}

function wait(ms: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
}

function pingResultToString(result: PingResult): string {
  switch (result) {
    case PingResult.ALIVE:
      return "alive";
    case PingResult.DEAD:
      return "dead";
    case PingResult.ERROR:
      return "error";
    default:
      return "unknown";
  }
}

function logResult(result: PingResult) {
  console.log([pingResultToString(result), Date.now(), Date()].join(","));
}

startConnectionMonitor();
