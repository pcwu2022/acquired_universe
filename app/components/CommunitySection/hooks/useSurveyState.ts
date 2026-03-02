"use client";
import { useState, useEffect } from "react";
import type { SurveyAnswers } from "../survey/questions";

export interface SurveyRecord {
  id: "singleton";
  submittedAt: string;
  answers: SurveyAnswers;
}

const DB_NAME = "acquired_community";
const STORE_NAME = "community_survey";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getRecord(): Promise<SurveyRecord | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get("singleton");
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function putRecord(record: SurveyRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function useSurveyState() {
  const [surveyRecord, setSurveyRecord] = useState<SurveyRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecord()
      .then(setSurveyRecord)
      .finally(() => setLoading(false));
  }, []);

  const saveSubmission = async (answers: SurveyAnswers) => {
    const record: SurveyRecord = {
      id: "singleton",
      submittedAt: new Date().toISOString(),
      answers,
    };
    await putRecord(record);
    setSurveyRecord(record);
  };

  return {
    surveyRecord,
    hasSubmitted: !loading && surveyRecord !== null,
    loading,
    saveSubmission,
  };
}
