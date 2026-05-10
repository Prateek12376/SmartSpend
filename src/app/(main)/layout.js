import React from 'react'

const MainLayout = ({children}) => {
  return (
    <div className='conatainer mx-auto my-32 '>{children}</div>  //we are wrpaing all the children routes here in div
  )
}

export default MainLayout