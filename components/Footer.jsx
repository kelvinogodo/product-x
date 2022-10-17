import React from 'react'
import {FiInstagram} from 'react-icons/fi'
import {IoLogoTwitter} from 'react-icons/io'
import {FaLinkedinIn} from 'react-icons/fa'
import {FaFacebookF} from 'react-icons/fa'
import Link from 'next/link'
const Footer = () => {
  return (
    <footer>
      <div className="foot-containers">
        <div className="right-foot">
          <div className="foot-logo">
            <FaLinkedinIn />
          </div>
          <div className='right-foot-text-container'>
            <p>hte djh h faa gfasy fgauassg asdasd asasgda fsdhg fa</p>
          </div>
          <div className="right-foot-icon-container">
            <FiInstagram />
            <FaLinkedinIn />
            <IoLogoTwitter />
            <FaFacebookF />
          </div>
        </div>
        <div className="left-foot">
          <div className='foot'>
            <h2>about</h2>
            <Link href='#'>about us</Link>
            <Link href='#'>news and blog</Link>
          </div>
          <div className='foot'>
          <h2>support</h2>
            <Link href='#'>faqs</Link>
            <Link href='#'>support service</Link>
            <Link href='#'>contact us</Link>
          </div>
        </div>
      </div>
      <div className="copyright-container">
        <p>&copy; 2022-All-Rights-Reserved</p>
      </div>
    </footer>
  )
}

export default Footer