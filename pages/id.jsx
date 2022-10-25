import React from 'react'
import Header from '../components/Header'
import Image from 'next/image'
import Footer from '../components/Footer'
import {useState} from 'react'
const Id = () => {
  const [emailModal,setEmailModal] = useState(false);
  const [showThanksModal,setShowThanksModal] = useState(false) 
  return (
    <>
    <Header />
    <section className="dynamic-landpage">
        <div className='dynamic-img-container'>
            <Image layout='fill' blurDataURL='/wallpaper (2).jpg' src='/wallpaper (2).jpg' placeholder='blur'/>
        </div>
        <div className="dynamic-text-container">
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem nam necessitatibus eaque natus a ab similique recusandae suscipit eum quia, voluptate numquam laborum ipsa fuga consequatur debitis quaerat nesciunt enim. </p>
            <span className='get-resource-btn' onClick={
              ()=>{
                setEmailModal(true)
              }
            }>get resources</span>
        </div>
    </section>
    {
      emailModal && 
      <section className='email-modal'>
        <form className='modal-form' onSubmit={(e)=>{
          e.preventDefault()
          setShowThanksModal(true)
          setEmailModal(false)
        }}>
          <input type='text' placeholder='Enter Your Name'/>
          <input type="email" value="" placeholder='Enter Your Email'/>
          <input type='submit' value='submit'/>
        </form>
      </section>
    }
    {
      showThanksModal && 
      <section className='thanks-modal' onClick={()=>{
        setShowThanksModal(false)
      }}>
        <div className='thanks'></div>
      </section>
    }
    <Footer />
    </>
  )
}

export default Id