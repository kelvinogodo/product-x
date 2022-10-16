import React from 'react'
import {BiChevronDown} from 'react-icons/bi'
import Link  from 'next/link';

const Header = () => {
  return (
    <header className='landpage-header'>
        <span className="logo-container"><h2>product x</h2></span>
        <nav>
          <ul>
            <li><Link href="/" className='home-link'>home</Link></li>
            <li><Link href="/course">category</Link>
            <BiChevronDown />
            </li>
            <li><Link href="/faq">faqs</Link></li>
          </ul>
        </nav>
      </header>
  )
}

export default Header