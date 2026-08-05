import React from "react";
import "./Feature.css";
import { assets } from "../../assets/assets";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 100
  },
  show: {
    opacity: 1,
    y: 0
  }
};


const Feature = () => {

  return (
    <section id="Feature">

      <div className="featurebar">

        <motion.h1
          className="header"

          variants={fadeUp}

          initial="hidden"
          whileInView="show"

          transition={{
            duration: 1
          }}

          viewport={{
            once:false,
            amount:0.3
          }}
        >
          Extra Activities
        </motion.h1>


        <div className="featurephoto">

          <motion.img
            src={assets.feature1}
            alt="feature1"
            className="feature1"

            variants={fadeUp}

            initial="hidden"
            whileInView="show"

            transition={{
              duration:1,
              delay:0.1
            }}

            viewport={{
              once:false,
              amount:0.3
            }}
          />


          <motion.img
            src={assets.feature2}
            alt="feature2"
            className="feature2"

            variants={fadeUp}

            initial="hidden"
            whileInView="show"

            transition={{
              duration:1,
              delay:0.25
            }}

            viewport={{
              once:false,
              amount:0.3
            }}
          />

          <motion.img
            src={assets.feature3}
            alt="feature3"
            className="feature3"

            variants={fadeUp}

            initial="hidden"
            whileInView="show"

            transition={{
              duration:1,
              delay:0.50
            }}

            viewport={{
              once:false,
              amount:0.3
            }}
          />
          <motion.img
            src={assets.feature4}
            alt="feature4"
            className="feature4"

            variants={fadeUp}

            initial="hidden"
            whileInView="show"

            transition={{
              duration:1,
              delay:0.75
            }}

            viewport={{
              once:false,
              amount:0.3
            }}
          />

        </div>
      </div>

    </section>
  )
}

export default Feature;