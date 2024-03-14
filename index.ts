import ping from "ping";

async function checkConnectionOnce() {
  const start = performance.now();
  try {
    const result = await ping.promise.probe("8.8.8.8");
    console.log(result);
  } catch (err) {
    console.error(err);
  } finally {
    const duration = performance.now() - start;
    console.log(`Duration: ${duration}ms`);
  }
}

checkConnectionOnce();
