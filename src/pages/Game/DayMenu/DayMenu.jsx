import {useState, useEffect} from 'react'
import Projects from '../../../assets/projects.json'
import './DayMenu.css'
import Project from '../Project/Project.jsx'

export default function DayMenu({eventHandler, projectState, player}){
    const [selectedProject, setSelectedProject] = useState({});
    const [selection, setSelection] = useState({});
    const [projectMappings, setProjectMappings] = useState({
        "Food": {
            name: "Food",
            type: "Activity",
            image: "activity/food.png",
            description: "Spend your day gathering and hunting to achieve food",
            reward: "+2 Food"
        },
        "Resources": {
            name: "Resources",
            type: "Activity",
            image: "activity/resources.png",
            description: "Spend your day retrieving various resources",
            reward: "+2 Resources"
        }
    });

    useEffect(() => {
        if (!player.flags) return;
        setProjectMappings(prev => {
            const updated = { ...prev };
            if (player.flags["extra-food"]) {
                updated["Food"] = {
                    ...updated["Food"],
                    reward: `+${2 + player.flags["extra-food"]} Food`
                };
            }
            if (player.flags["extra-resource"]) {
                updated["Resources"] = {
                    ...updated["Resources"],
                    reward: `+${2 + player.flags["extra-resource"]} Resources`
                };
            }
            return updated;
        });
    }, [player.flags]);

    function nonProjectEventHandler(event){
        setSelection(event);
    }

    useEffect(() => {
        if(!selectedProject || !selectedProject.name) return;
        setSelection(selectedProject);
    }, [selectedProject]);

    if(player.flags["no-day-act"]) return <></>;

    return (<>  
        <div className="daymenu-flex">
            <div className="game-button-grid">
                { (player.flags && player.flags["no-food-gather"]) ||
                    <button className="game-button" onClick={() => nonProjectEventHandler({isFood: true, type: "Food", isProject: false})}>Gather Food</button>
                }
                { (player.flags && player.flags["no-resource-gather"]) || 
                    <button className="game-button" onClick={() => nonProjectEventHandler({isRes: true, type: "Resources", isProject: false})}>Gather Resources</button>
                }
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
            {selectedProject && <Project className="project-detailed" project={projectMappings[selection.type] ? 
            projectMappings[selection.type] :
            selection
            } submitEvent={() => eventHandler(selection)}/>}
        </div>
    </>);
}