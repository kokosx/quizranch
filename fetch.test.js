const main = () => {
  for (let i = 0; i < 1500; i++) {
    fetch("https://quizranch.vercel.app").then(() => console.log("worked"));
  }
};

main();
