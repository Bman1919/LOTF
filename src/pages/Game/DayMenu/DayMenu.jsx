import {useState, useEffect} from 'react'
import Projects from '../../../assets/projects.json'
import './DayMenu.css'
import Project from '../Project/Project.jsx'

export default function DayMenu({eventHandler}){
    const [projectMenuOpen, setProjectMenuOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState({});

    useEffect(() => {
        if(!selectedProject) return;
        eventHandler({
            project: selectedProject
        });
    }, [selectedProject]);

    return (<>  
        <div className="game-button-grid">
            <button onClick={() => eventHandler({isFood: true, type: "Food"})}>Gather Food</button>
            <button onClick={() => eventHandler({isRes: true, type: "Resources"})}>Gather Resources</button>
            <button onClick={() => setProjectMenuOpen(prev => !prev)}>Work on Project</button>
        </div>
        <div>
            {
                (projectMenuOpen) && (
                    <ul className='project-table'>
                        <li className='project-column'>
                            {
                                Projects.active.map((u,i) => (
                                    <span onClick={()=>{setSelectedProject(u)}}>{u.name}</span>
                                ))
                            }
                        </li>
                        <li className='project-column'>
                            {
                                Projects.passive.map((u,i) =>(
                                    <span onClick={()=>{setSelectedProject(u)}}>{u.name}</span>
                                ))
                            }
                        </li>
                    </ul>
                )
            }
        </div>
        {(selectedProject.type && projectMenuOpen) && <Project className="project-detailed" project={selectedProject}/>}
    </>);
}