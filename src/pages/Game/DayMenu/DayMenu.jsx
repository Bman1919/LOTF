import {useState, useEffect} from 'react'
import Projects from '../../../assets/projects.json'
import './DayMenu.css'
import Project from '../Project/Project.jsx'

export default function DayMenu({eventHandler, projectState}){
    const [projectMenuOpen, setProjectMenuOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState({});

    function nonProjectEventHandler(event){
        eventHandler(event);
        setSelectedProject(projectMappings[event.type]);
    }

    useEffect(() => {
        if(!selectedProject) return;
        eventHandler({
            type: "Project",
            project: selectedProject
        });
    }, [selectedProject]);

    return (<>  
        <div className="daymenu-flex">
            <div className="game-button-grid">
                <button className="game-button" onClick={() => nonProjectEventHandler({isFood: true, type: "Food"})}>Gather Food</button>
                <button className="game-button" onClick={() => nonProjectEventHandler({isRes: true, type: "Resources"})}>Gather Resources</button>
            </div>
            {
                (
                    <ul className='project-table'>
                        <li className='project-header' key={0}>
                            <span>Project Name</span>
                            <span></span>
                        </li>
                        {
                            Projects.active.map((u, i) => (
                                <li key={`active-${i}`} className="project-row" onClick={() => {setSelectedProject(u);}}><span>{u.name}</span><span><img src={`/${u.image}`}/></span></li>
                            ))
                        }
                        {
                            Projects.passive.map((u, i) => {
                                const isAlive = projectState.passive && projectState.passive[i] ? projectState.passive[i].isAlive : false;
                                return (
                                    <li
                                        className={`project-row${isAlive ? "" : " dead"}`}
                                        onClick={() => { setSelectedProject(u); }}
                                        key={`passive-${i}`}
                                    >
                                        <span>{u.name}</span>
                                        <span><img src={`/${u.image}`} /></span>
                                    </li>
                                );
                            })
                        }
                    </ul>
                )
            }
        </div>
        <div className='project-detailed'>
            {selectedProject && <Project className="project-detailed" project={selectedProject}/>}
        </div>
    </>);
}

const projectMappings = {
    "Food": {
        name: "Food",
        type: "Activity",
        image: "activity/food.png",
        description: "Spend your day gathering and hunting to acheive food",
        reward: "+2 Food"
    },
    "Resources": {
        name: "Resources",
        type: "Activity",
        image: "activity/resources.png",
        description: "Spend your day retrieving various resources",
        reward: "+2 Resources"
    }
}