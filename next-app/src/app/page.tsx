import { NextServerComponentProps } from '@/types';
import React from 'react'
import Projects from './projects/page';

async function Home(props: NextServerComponentProps) {
  return (
    <Projects {...props}/>
  )
}


export default Home
