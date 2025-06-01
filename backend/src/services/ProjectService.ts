// import prisma from '../db/prisma';
// import { Project, ProjectStatus, Prisma } from '@prisma/client';

// export async function createProject(projectData: Prisma.ProjectCreateInput): Promise<Project> {
//   const project = await prisma.project.create({
//     data: projectData,
//   });
//   return project;
// }

// export async function getAllProjects(ownerId?: string): Promise<Project[]> {
//   const whereClause = ownerId ? { ownerId } : {};

//   const projects = await prisma.project.findMany({
//     where: whereClause,
//     include: {
//       owner: {
//         select: {
//           id: true,
//           name: true,
//           username: true,
//           email: true,
//         },
//       },
//       // You might want to include a count of bids or a summary of selected bid here
//       // bids: {
//       //   select: { id: true, quote: true }
//       // },
//       // selectedBid: true // Only if you need full selected bid details
//     },
//     orderBy: {
//       createdAt: 'desc', // Order by creation date, newest first
//     },
//   });
//   return projects;
// }


// export async function getProjectById(id: string): Promise<Project | null> {
//   // Use Prisma's findUnique method to find a project by its unique ID.
//   // Include owner and selected bid details for comprehensive view.
//   const project = await prisma.project.findUnique({
//     where: { id },
//     include: {
//       owner: {
//         select: {
//           id: true,
//           name: true,
//           username: true,
//           email: true,
//           contactNo: true, // Include contact for buyer
//         },
//       },
//       bids: {
//         // Include all bids on this project, ordered by quote
//         orderBy: {
//           quote: 'asc',
//         },
//         include: {
//           bidder: {
//             select: {
//               id: true,
//               name: true,
//               username: true,
//               email: true,
//               bio: true,
//             },
//           },
//         },
//       },
//       selectedBid: {
//         include: {
//           bidder: {
//             select: {
//               id: true,
//               name: true,
//               username: true,
//               email: true,
//               contactNo: true, // Include contact for selected seller
//             },
//           },
//         },
//       },
//     },
//   });
//   return project;
// }

// /**
//  * Updates an existing project in the database.
//  * @param id The ID of the project to update.
//  * @param updateData The data to update the project with, conforming to Prisma's ProjectUpdateInput.
//  * @returns The updated project object.
//  */
// export async function updateProject(id: string, updateData: Prisma.ProjectUpdateInput): Promise<Project> {
//   // Use Prisma's update method to modify an existing project record.
//   const updatedProject = await prisma.project.update({
//     where: { id },
//     data: updateData,
//   });
//   return updatedProject;
// }

// /**
//  * Deletes a project from the database.
//  * @param id The ID of the project to delete.
//  * @returns The deleted project object.
//  */
// export async function deleteProject(id: string): Promise<Project> {
//   // Use Prisma's delete method to remove a project record.
//   const deletedProject = await prisma.project.delete({
//     where: { id },
//   });
//   return deletedProject;
// }


// export async function updateProjectStatus(id: string, status: ProjectStatus): Promise<Project> {
//   const updatedProject = await prisma.project.update({
//     where: { id },
//     data: { status },
//   });
//   return updatedProject;
// }

// // You can add more project-related service functions here as needed.