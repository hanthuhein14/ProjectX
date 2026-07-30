import React from 'react'
import { motion } from "framer-motion";
import './aboutus.css';
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
const aboutus = () => {
  return (
    <section id="About">
    <div className='aboutusbar'>
        
      <motion.h1
          className="aboutus"

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
          About Us
        </motion.h1>
        <motion.p
          className="para"

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
           Welcome to our travel platform, where we help you discover amazing destinations
  and create unforgettable experiences. Our goal is to make travel planning easier
  by providing useful information, inspiring ideas, and personalized recommendations
  for every type of traveler. Whether you are searching for adventure, relaxation,
  or cultural experiences, we are dedicated to helping you explore the world,
  discover new places, and turn every journey into a memorable story.
        </motion.p>
        
    </div>
    </section>
  )
}

export default aboutus
