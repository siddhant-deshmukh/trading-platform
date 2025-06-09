import { IProject } from "@/types";
import { ClientLink } from "./ClientLink";

interface ProjectCardProps {
  project: IProject;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {

  return (
    <ClientLink href={`/projects/${project.id}`}>
      <div className="bg-white shadow-md rounded-lg p-6 mb-4">
        <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
        {project.description && (
          <p className="text-gray-600 mb-4">{project.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {project.budgetMin !== null || project.budgetMax !== null ? (
            <span className="status-badge badge-blue">
              Budget: {project.budgetMin !== null ? `$${project.budgetMin}` : ''}
              {project.budgetMin !== null && project.budgetMax !== null ? ' - ' : ''}
              {project.budgetMax !== null ? `$${project.budgetMax}` : ''}
              {project.budgetMin === null && project.budgetMax === null && 'N/A'}
            </span>
          ) : (
            <span className="status-badge badge-blue">
              Budget: N/A
            </span>
          )}

          <span
            className={`status-badge badge-${project.status}`}
          >
            Status: {project.status}
          </span>

          {project.owner && (
            <div className="flex justify-between items-center">
              <span className="status-badge badge-purple">
                Owner: {project.owner.name} @{project.owner.username}
              </span>
              
            </div>
          )}

          {project.selectedBid ? (
            <>
              <span className="status-badge badge-green">
                Selected Bid: ${project.selectedBid.quote} {/* Assuming selectedBid has a 'value' property */}
              </span>
              {project.deadline && (
                <span className="status-badge badge-indigo">
                  Deadline in {project.selectedBid.estimatedTime} days
                </span>
              )}
            </>
          ) : (
            project._count?.bids !== undefined && (
              <span className="status-badge badge-sky">
                Total Bids: {project._count.bids}
              </span>
            )
          )}
        </div>
      </div>
    </ClientLink>
  );
};

export default ProjectCard;