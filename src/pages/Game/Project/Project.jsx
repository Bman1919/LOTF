import './Project.css'

export default function Project({ project, submitEvent, disabled }) {
    if(!project || !project.type){
        return null;
    }

    return (
        <div className={`project-card project-${project.type}`}>
            <div className="project-title">{project.name}</div>
            <button
                className="project-submit-btn"
                onClick={() => submitEvent && submitEvent()}
                style={{position: 'absolute', top: 8, right: 8}}
                disabled={disabled ?? false}
            >Submit</button>
            {project.type && (<div className="project-type">{project.type.charAt(0).toUpperCase() + project.type.slice(1)}{(project.type === "passive" || project.type === "active") ? " Project" : ""}</div>)}
            <div className="project-description">{project.description}</div>
            {project.cost && (
                <div className="project-cost">
                    <strong>Cost:</strong> {Object.entries(project.cost).map(([k, v]) => `${v} ${k}`).join(', ')}
                </div>
            )}
            {project.upkeep && (
                <div className="project-upkeep">
                    <strong>Upkeep:</strong> {Object.entries(project.upkeep).map(([k, v]) => `${v} ${k}`).join(', ')}
                </div>
            )}
            {project.effect && (
                <div className="project-effect">
                    <strong>Effect:</strong> {project.effect}
                </div>
            )}
            {project.reward && (
                <div className="project-reward">
                    <strong>Reward:</strong> {project.reward}
                </div>
            )}
        </div>
    );
}