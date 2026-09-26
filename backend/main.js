import { fork } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const scripts = [
  { name: "Dotenv Coder", path: path.join(__dirname, "server.js") },
  { name: "Personal LinkedIn", path: path.join(__dirname, "index_tech1.js") },
  { name: "KanhaCode (Bhagavad Gita Wisdom)", path: path.join(__dirname, "index2.js") },
  { name: "being", path: path.join(__dirname, "app.js") },
];

scripts.forEach((script) => {
  const child = fork(script.path);

  child.on("error", (err) => {
    console.error(`Error in ${script.name}:`, err.message);
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`${script.name} exited with code ${code}`);
    }
  });
});

console.log("Main process stopped automatic execution of all scripts.");
console.log("Please run specific scripts instead, e.g.: node app.js");
