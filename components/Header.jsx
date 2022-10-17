import React from 'react'
import {BiChevronDown} from 'react-icons/bi'
import Link  from 'next/link';

const Header = () => {
  return (
    <header className='landpage-header'>
        <span className="logo-container"><h2>product x</h2></span>
        <nav>
          <ul>
            <li className='home-link'><Link href="/" >home</Link></li>
            <li className='drop-down-container'><Link href="/course">category</Link>
            <BiChevronDown />
              <ul className="drop-down">
                <li><Link href="/course">data</Link></li>
                <li><Link href="/course">management</Link></li>
                <li><Link href="/course">design</Link></li>
                <li><Link href="/course">product</Link></li>
              </ul>
            </li>
            <li><Link href="/faq">faqs</Link></li>
          </ul>
        </nav>
      </header>
  )
}

export default Header