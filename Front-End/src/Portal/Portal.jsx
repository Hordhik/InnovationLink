import React from 'react'
import TopBar from './TopBar';
import SideBar from './SideBar';
import Home from './Home';
import './Portal.css';


function Portal() {
  return (
    <div className='portal-container'>
        <TopBar />
        <div className='portal-content'>
            <SideBar />
            <Home />
        </div>
    </div>
  )
}

export default Portal