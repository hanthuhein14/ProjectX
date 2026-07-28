import { useEffect, useState } from "react";
import "./Home.css";

const Home = () => {
  const text1 = "Let's get success together.";
  const text2 = "We're always by your side.";

  const [display1, setDisplay1] = useState("");
  const [display2, setDisplay2] = useState("");

  useEffect(() => {
    let typing1;
    let typing2;
    let restart;

    const startTyping = () => {
      let i = 0;
      let j = 0;

      setDisplay1("");
      setDisplay2("");

      typing1 = setInterval(() => {
        setDisplay1(text1.slice(0, i));
        i++;

        if (i > text1.length) {
          clearInterval(typing1);

          // Start second text
          typing2 = setInterval(() => {
            setDisplay2(text2.slice(0, j));
            j++;

            if (j > text2.length) {
              clearInterval(typing2);

              // Wait before restarting
              restart = setTimeout(() => {
                startTyping();
              }, 3000); // 3 seconds delay
            }
          }, 100);
        }
      }, 100);
    };

    startTyping();

    return () => {
      clearInterval(typing1);
      clearInterval(typing2);
      clearTimeout(restart);
    };

  }, []);

  return (
    <div className="homebar">
      <h1 className="H1">
        {display1}
        <span className="cursor">_</span>
      </h1>

      <h2 className="H2">
        {display2}
        <span className="cursor">_</span>
      </h2>
    </div>
  );
};

export default Home;