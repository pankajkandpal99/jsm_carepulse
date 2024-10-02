"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ID, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import {
  BUCKET_ID,
  DATABASE_ID,
  databases,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  storage,
  users,
} from "../appwrite.config";
import { parseStringify } from "../utils";

export const createUser = async (user: CreateUserParams) => {
  // console.log("user: ", users);

  try {
    const newUser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined, // skip the password here...
      user.name
    );
    // console.warn({ newUser });
    return parseStringify(newUser);
  } catch (error: any) {
    console.error("Appwrite Error: ", error);
    if (error && error?.code === 409) {
      const documents = await users.list([Query.equal("email", [user.email])]);

      return documents?.users[0];
    }
  }
};

export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    // console.log(user);
    return parseStringify(user);
  } catch (error) {
    console.error("Error while fetching users: ", error);
  }
};

export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    let file;
    if (identificationDocument) {
      const blob = identificationDocument?.get("blobFile") as Blob;
      if (blob) {
        // Convert Blob to Buffer for Node.js
        const buffer = await blob.arrayBuffer();
        const inputFile = InputFile.fromBuffer(
          Buffer.from(buffer),
          identificationDocument?.get("fileName") as string
        );

        // Upload file to Appwrite storage
        file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
      }
    }

    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id || null,
        identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
        ...patient,
      }
    );

    return parseStringify(newPatient);
  } catch (error: any) {
    console.error(`Error occured while registering the Patient.`, error);
  }
};

export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );
    // console.log(patients);
    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.error("Error while fetching users: ", error);
  }
};
