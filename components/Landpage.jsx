import React from 'react'
import {BsSearch} from 'react-icons/bs'
import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

import { Autoplay, Pagination} from "swiper";
const Landpage = () => {
  return (
    <>
    <section className='landpage'>
      
      <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          modules={[Autoplay, Pagination]}
          className="mySwiper inner-landpage-section"
          >
            <SwiperSlide className='my-swiper-slide'>
              <Image layout='fill' alt='swiper slide image' src='/wallpaper (1).jpeg' className='swiper-slide-img' priority/>
            </SwiperSlide>
            <SwiperSlide className='my-swiper-slide'>
              <Image layout='fill' alt='swiper slide image' src='/wallpaper (1).jpg' className='swiper-slide-img' priority/>
            </SwiperSlide>
            <SwiperSlide className='my-swiper-slide'>
              <Image layout='fill' alt='swiper slide image' src='/wallpaper (2).jpg' className='swiper-slide-img' priority/>
            </SwiperSlide>
        </Swiper>
        <div className="landpage-text-container">
          <div className="text-container">
            <h1>experience interactive learning. your gateway to success every lesson counts</h1>
            <div className="search-container">
              <input type="search" name="" id="" placeholder='search' className='search-input'/>
              <span className='search-btn-container'><BsSearch/></span>
            </div>
          </div>
        </div>
    </section>
    <section className="course-listing">
      <div className='course-list-card'>
        <span className='card-details'>
          <h2>3D beginners course</h2>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas in error ipsam enim</p>
        </span>
      </div>
      <div className='course-list-card'>
      <span className='card-details'>
      <h2>adobe photoshop</h2>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas in error ipsam enim</p>
      </span>
      </div>
      <div className='course-list-card'>
      <span className='card-details'>
      <h2>data science</h2>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas in error ipsam enim</p>
      </span>
      </div>
      <div className='course-list-card'>
      <span className='card-details'>
      <h2>figma for newbies</h2>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas in error ipsam enim</p>
      </span>
      </div>
      <div className='course-list-card'>
      <span className='card-details'>
        <h2>front-end web developement</h2>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas in error ipsam enim</p>
      </span>
      </div>
      <div className='course-list-card'>
      <span className='card-details'>
      <h2>front-end web developement</h2>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas in error ipsam enim</p>
      </span>
      </div>
    </section>
    </>
  )
}

export default Landpage