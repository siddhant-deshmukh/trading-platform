import CreateProjectForm from '@/app/projects/components/ProjectForm';
import ProjectCard from '@/app/projects/components/ProjectCard';
import { get } from '@/lib/apiCallServer';
import { IProject, NextServerComponentProps } from '@/types';
import React from 'react'
import { cookies } from 'next/headers';


async function Projects({ searchParams } : NextServerComponentProps) {
  const { tab } = await searchParams;
  const auth_token = (await cookies()).get('auth_token_next')
  const { data: projects, msg, err } = await get<IProject[]>(`/product?tab=${tab}`, {
    headers: {
      'Authorization': auth_token?.value
    },
    withCredentials: true
  });
  const not_found_msg = () => {
    if(tab == 'bids' ) return 'You have not place any bids';
    else if(tab == 'active_bids' ) return 'You do not have any active bids';
    else if(tab == 'my_projects') return 'You do not created any projects';
    else if(tab == 'open_projects') return 'No Open projects for you';  
    else return 'No Projects Found'
  }

  if(!projects) {
    <div>Something went wrong!</div>
  }


  return (
    <div className=''>
      {
        projects?.length == 0 && 
        <div className='py-2 px-1'>{not_found_msg()}</div>
      }
      {
        projects?.map((ele)=> {
          return <ProjectCard key={ele.id} project={ele} />
        })
      }
    </div>
  )
}

export default Projects
