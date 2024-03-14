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
    const result = await checkConnectionOnce();
    if (result !== lastResult) {
      logResult(result);
    }
    lastResult = result;
  } while (run);
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
