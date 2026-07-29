import { useState, useRef, useEffect, useMemo } from "react";
import XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import {
  isBackendConfigured,
  loadTeamMembers, saveTeamMembers,
  loadConditions, saveConditions,
  loadMonthData, saveMonthOverrides, saveMonthAdhocList,
  loadRosterMonth, saveRosterMonth, deleteRosterMonth,
  logAuditEvent,
} from "./lib/store";

const INITIAL_TEAM = [
  { id: 1,  name: "Mukilan Sivasankaran",  tech: "Project Management", role: "Sr. Manager",       location: "Offshore", city: "Chennai",   isManager: true, fixedShift: "GEN", phone: "+91 98765 10001", pin: "1010" },
  { id: 2,  name: "Narasingha",            tech: "Oracle",             role: "Manager",            location: "Onsite",   city: "Anchorage",                                   phone: "+1 907 555 1002", pin: "1010" },
  { id: 3,  name: "Biswadeep",             tech: "IDMC",               role: "Manager",            location: "Onsite",   city: "Anchorage",                                   phone: "+1 907 555 1003", pin: "1010" },
  { id: 4,  name: "Guy Andrichuk",         tech: "Databricks",         role: "Manager",            location: "Onsite",   city: "Seattle",                                     phone: "+1 206 555 1004", pin: "1010" },
  { id: 5,  name: "Krithika",              tech: "IDMC",               role: "Lead - IDMC",        location: "Offshore", city: "Chennai",   isLead: true,                    phone: "+91 98765 10005", pin: "1010" },
  { id: 6,  name: "Gokuldass",             tech: "Databricks",         role: "Lead - Databricks",  location: "Offshore", city: "Chennai",   isLead: true,                    phone: "+91 98765 10006", pin: "1010" },
  { id: 7,  name: "Madhu",                 tech: "IDMC",               role: "Data Engineer",      location: "Offshore", city: "Chennai",                                   phone: "+91 98765 10007", pin: "1234" },
  { id: 8,  name: "Hari Annamalai",        tech: "IDMC",               role: "Sr. Data Engineer",  location: "Offshore", city: "Chennai",   isSenior: true, phone: "+91 98765 10008", pin: "1234" },
  { id: 9,  name: "Sathish",               tech: "IDMC",               role: "Data Engineer",      location: "Offshore", city: "Chennai",                                    phone: "+91 98765 10009", pin: "1234" },
  { id: 10, name: "Sriram",                tech: "Databricks",         role: "Data Engineer",      location: "Offshore", city: "Chennai",                                    phone: "+91 98765 10010", pin: "1234" },
  { id: 11, name: "Shivani",               tech: "Databricks",         role: "Data Engineer",      location: "Offshore", city: "Hyderabad", swapShift: true,                    phone: "+91 98765 10011", pin: "1234" },
  { id: 12, name: "Gokul",                 tech: "Databricks",         role: "Data Engineer",      location: "Offshore", city: "Chennai",   swapShift: true,                    phone: "+91 98765 10012", pin: "1234" },
  { id: 13, name: "Devansh",               tech: "Databricks",         role: "Data Engineer",      location: "Offshore", city: "Pune",                                       phone: "+91 98765 10013", pin: "1234" },
  { id: 14, name: "Dhanalakshmi",          tech: "IDMC",               role: "Data Engineer",      location: "Offshore", city: "Chennai",                                    phone: "+91 98765 10014", pin: "1234" },
  { id: 15, name: "Supraja",               tech: "IDMC",               role: "Data Engineer",      location: "Offshore", city: "Bangalore",                                  phone: "+91 98765 10015", pin: "1234" },
  { id: 16, name: "Bhavani",               tech: "Oracle",             role: "Data Engineer",      location: "Offshore", city: "Chennai",                                    phone: "+91 98765 10016", pin: "1234" },
  { id: 17, name: "Madan Saravanan",       tech: "Oracle",             role: "Lead - Oracle ODI",  location: "Offshore", city: "Chennai",   isLead: true,                    phone: "+91 98765 10017", pin: "1010" },
  { id: 18, name: "Harsh Tailor",          tech: "Databricks",         role: "Data Engineer",      location: "Offshore", city: "Mumbai",                                    phone: "+91 98765 10018", pin: "1234" },
  { id: 19, name: "Sathyanarayanan",       tech: "Oracle",             role: "Sr. Data Engineer",  location: "Offshore", city: "Chennai",   isSenior: true,                  phone: "+91 98765 10019", pin: "1234" },
  { id: 20, name: "Raghavendra",           tech: "Databricks",         role: "Data Engineer",      location: "Offshore", city: "Bangalore",                                  phone: "+91 98765 10020", pin: "1234" },
  { id: 21, name: "Yashashree",            tech: "IDMC",               role: "Data Engineer",      location: "Offshore", city: "Pune",                                       phone: "+91 98765 10021", pin: "1234" },
  { id: 22, name: "Soumyadip",             tech: "IDMC",               role: "Data Engineer",      location: "Offshore", city: "Kolkata",                                    phone: "+91 98765 10022", pin: "1234" },
  { id: 23, name: "Suresh Devaram",        tech: "Databricks",         role: "Data Engineer",      location: "Offshore", city: "Hyderabad",                                  phone: "+91 98765 10023", pin: "1234" },
  { id: 24, name: "Rahul Raj",             tech: "Databricks",         role: "Data Engineer",      location: "Offshore", city: "Chennai",                                    phone: "+91 98765 10024", pin: "1234" },
  { id: 25, name: "Sarah Nizam",           tech: "Databricks",         role: "Data Engineer",      location: "Offshore", city: "Chennai",                                    phone: "+91 98765 10025", pin: "1234" },
  { id: 26, name: "Mallela Rajyalakshmi",  tech: "IDMC",               role: "Data Engineer",      location: "Offshore", city: "Hyderabad",                                  phone: "+91 98765 10026", pin: "1234" },
  { id: 27, name: "Yalamanchili Meghana",  tech: "IDMC",               role: "Data Engineer",      location: "Offshore", city: "Hyderabad",                                  phone: "+91 98765 10027", pin: "1234" },
  { id: 28, name: "Sivaranjani Thangaraj", tech: "Databricks",         role: "Data Engineer",      location: "Offshore", city: "Chennai",                                    phone: "+91 98765 10028", pin: "1234" },
  { id: 29, name: "M. Swathi Sree",        tech: "Oracle",             role: "Data Engineer",      location: "Offshore", city: "Chennai",                                    phone: "+91 98765 10029", pin: "1234" },
  { id: 30, name: "Kiruthika Shree B",     tech: "Oracle",             role: "Data Engineer",      location: "Offshore", city: "Chennai",   swapShift: true,                    phone: "+91 98765 10030", pin: "1234" },
  { id: 31, name: "Aishwarya H",           tech: "Databricks",         role: "Data Engineer",      location: "Offshore", city: "Bangalore", swapShift: true,                    phone: "+91 98765 10031", pin: "1234" },
  { id: 32, name: "Aahad Syed",            tech: "Oracle",             role: "Data Engineer",      location: "Offshore", city: "Hyderabad",                                  phone: "+91 98765 10032", pin: "1234" },
];

const ROLES = ["Sr. Manager","Manager","Lead - IDMC","Lead - Databricks","Lead - Oracle ODI","Sr. Data Engineer","Data Engineer"];
const DESIGNATIONS = ["SPM","M","SA","PA","A","PAT"];
const TECHS = ["IDMC","Databricks","Oracle","Project Management"];

// First month from which the roster history starts.
const ROSTER_START = {
  year: 2026,
  month: 7,
  day: 13
};

// Manual production roster seed supplied for July 13-31, 2026.
// August and future rosters use this seed for cross-month weekend history
// and bi-weekly S1/S2 continuation.
const JULY_2026_SEED_ROSTER = {
  1: { 13: "GEN", 14: "GEN", 15: "GEN", 16: "GEN", 17: "GEN", 18: "OFF", 19: "OFF", 20: "GEN", 21: "GEN", 22: "GEN", 23: "GEN", 24: "GEN", 25: "OFF", 26: "OFF", 27: "GEN", 28: "GEN", 29: "GEN", 30: "GEN", 31: "GEN" },
  2: { 13: "G-PST", 14: "G-PST", 15: "G-PST", 16: "G-PST", 17: "G-PST", 18: "OFF", 19: "OFF", 20: "G-PST", 21: "G-PST", 22: "G-PST", 23: "G-PST", 24: "G-PST", 25: "OFF", 26: "OFF", 27: "G-PST", 28: "G-PST", 29: "G-PST", 30: "G-PST", 31: "G-PST" },
  3: { 13: "G-PST", 14: "G-PST", 15: "G-PST", 16: "G-PST", 17: "G-PST", 18: "OFF", 19: "OFF", 20: "G-PST", 21: "G-PST", 22: "G-PST", 23: "G-PST", 24: "G-PST", 25: "OFF", 26: "OFF", 27: "G-PST", 28: "G-PST", 29: "G-PST", 30: "G-PST", 31: "G-PST" },
  4: { 13: "G-PST", 14: "G-PST", 15: "G-PST", 16: "G-PST", 17: "G-PST", 18: "OFF", 19: "OFF", 20: "G-PST", 21: "G-PST", 22: "G-PST", 23: "G-PST", 24: "G-PST", 25: "OFF", 26: "OFF", 27: "G-PST", 28: "G-PST", 29: "G-PST", 30: "G-PST", 31: "G-PST" },
  5: { 13: "S2", 14: "S2", 15: "S2", 16: "S2", 17: "S2", 18: "OFF", 19: "OFF", 20: "S2", 21: "S2", 22: "S2", 23: "S2", 24: "S2", 25: "OFF", 26: "OFF", 27: "S1", 28: "S1", 29: "S1", 30: "S1", 31: "S1" },
  6: { 13: "S2", 14: "S2", 15: "S2", 16: "S2", 17: "S2", 18: "OFF", 19: "OFF", 20: "S2", 21: "S2", 22: "S2", 23: "S2", 24: "S2", 25: "OFF", 26: "OFF", 27: "S1", 28: "S1", 29: "S1", 30: "S1", 31: "S1" },
  7: { 13: "S1", 14: "S1", 15: "S1", 16: "S1", 17: "S1", 18: "OFF", 19: "OFF", 20: "S1", 21: "S1", 22: "S1", 23: "S1", 24: "S1", 25: "OFF", 26: "OFF", 27: "S2", 28: "S2", 29: "S2", 30: "S2", 31: "S2" },
  8: { 13: "S2", 14: "S2", 15: "S2", 16: "S2", 17: "S2", 18: "WS2", 19: "OFF", 20: "S2", 21: "S2", 22: "S2", 23: "S2", 24: "S2", 25: "OFF", 26: "OFF", 27: "S1", 28: "S1", 29: "S1", 30: "S1", 31: "S1" },
  9: { 13: "S2", 14: "S2", 15: "S2", 16: "S2", 17: "S2", 18: "OFF", 19: "WS1", 20: "S2", 21: "S2", 22: "S2", 23: "S2", 24: "OFF", 25: "OFF", 26: "OFF", 27: "S1", 28: "S1", 29: "S1", 30: "S1", 31: "S1" },
  10: { 13: "S1", 14: "S1", 15: "S1", 16: "S1", 17: "S1", 18: "OFF", 19: "OFF", 20: "S1", 21: "S1", 22: "S1", 23: "S1", 24: "S1", 25: "WS2", 26: "OFF", 27: "OFF", 28: "S2", 29: "S2", 30: "S2", 31: "S2" },
  11: { 13: "S1", 14: "S1", 15: "S1", 16: "S1", 17: "S1", 18: "OFF", 19: "WS1", 20: "S1", 21: "OFF", 22: "S1", 23: "S1", 24: "S1", 25: "OFF", 26: "OFF", 27: "S2", 28: "S2", 29: "S2", 30: "S2", 31: "S2" },
  12: { 13: "S2", 14: "S2", 15: "S2", 16: "S2", 17: "S2", 18: "OFF", 19: "OFF", 20: "S2", 21: "S2", 22: "S2", 23: "S2", 24: "OFF", 25: "OFF", 26: "WS1", 27: "S1", 28: "S1", 29: "S1", 30: "S1", 31: "S1" },
  13: { 13: "S1", 14: "S1", 15: "S1", 16: "S1", 17: "S1", 18: "WS1", 19: "OFF", 20: "OFF", 21: "S1", 22: "S1", 23: "S1", 24: "S1", 25: "OFF", 26: "OFF", 27: "S2", 28: "S2", 29: "S2", 30: "S2", 31: "S2" },
  14: { 13: "S1", 14: "S1", 15: "S1", 16: "S1", 17: "S1", 18: "OFF", 19: "OFF", 20: "S1", 21: "S1", 22: "S1", 23: "S1", 24: "OFF", 25: "OFF", 26: "WS1", 27: "S2", 28: "S2", 29: "S2", 30: "S2", 31: "S2" },
  15: { 13: "S2", 14: "S2", 15: "S2", 16: "S2", 17: "S2", 18: "WS1", 19: "OFF", 20: "OFF", 21: "S2", 22: "S2", 23: "S2", 24: "S2", 25: "OFF", 26: "OFF", 27: "S1", 28: "S1", 29: "S1", 30: "S1", 31: "S1" },
  16: { 13: "S2", 14: "S2", 15: "S2", 16: "S2", 17: "S2", 18: "WS1", 19: "OFF", 20: "OFF", 21: "S2", 22: "S2", 23: "S2", 24: "S2", 25: "OFF", 26: "OFF", 27: "S1", 28: "S1", 29: "S1", 30: "S1", 31: "S1" },
  17: { 13: "S1", 14: "S1", 15: "S1", 16: "S1", 17: "S1", 18: "OFF", 19: "OFF", 20: "S1", 21: "S1", 22: "S1", 23: "S1", 24: "S1", 25: "OFF", 26: "OFF", 27: "S2", 28: "S2", 29: "S2", 30: "S2", 31: "S2" },
  18: { 13: "S2", 14: "S2", 15: "S2", 16: "S2", 17: "S2", 18: "OFF", 19: "OFF", 20: "S2", 21: "S2", 22: "S2", 23: "S2", 24: "S2", 25: "WS2", 26: "OFF", 27: "OFF", 28: "S1", 29: "S1", 30: "S1", 31: "S1" },
  19: { 13: "S1", 14: "S1", 15: "S1", 16: "S1", 17: "S1", 18: "OFF", 19: "OFF", 20: "S1", 21: "S1", 22: "S1", 23: "S1", 24: "S1", 25: "OFF", 26: "OFF", 27: "S2", 28: "S2", 29: "S2", 30: "S2", 31: "S2" },
  20: { 13: "S2", 14: "S2", 15: "S2", 16: "S2", 17: "S2", 18: "OFF", 19: "WS2", 20: "S2", 21: "OFF", 22: "S2", 23: "S2", 24: "S2", 25: "OFF", 26: "OFF", 27: "S1", 28: "S1", 29: "S1", 30: "S1", 31: "S1" },
  21: { 13: "S1", 14: "S1", 15: "S1", 16: "S1", 17: "S1", 18: "OFF", 19: "OFF", 20: "S1", 21: "S1", 22: "S1", 23: "S1", 24: "S1", 25: "WS1", 26: "OFF", 27: "OFF", 28: "S2", 29: "S2", 30: "S2", 31: "S2" },
  22: { 13: "S2", 14: "S2", 15: "S2", 16: "S2", 17: "S2", 18: "OFF", 19: "WS2", 20: "S2", 21: "OFF", 22: "S2", 23: "S2", 24: "S2", 25: "OFF", 26: "OFF", 27: "S1", 28: "S1", 29: "S1", 30: "S1", 31: "S1" },
  23: { 13: "S1", 14: "S1", 15: "S1", 16: "S1", 17: "S1", 18: "OFF", 19: "OFF", 20: "S1", 21: "S1", 22: "S1", 23: "S1", 24: "OFF", 25: "OFF", 26: "WS2", 27: "S2", 28: "S2", 29: "S2", 30: "S2", 31: "S2" },
  24: { 13: "S2", 14: "S2", 15: "S2", 16: "S2", 17: "S2", 18: "WS2", 19: "OFF", 20: "OFF", 21: "S2", 22: "S2", 23: "S2", 24: "S2", 25: "OFF", 26: "OFF", 27: "S1", 28: "S1", 29: "S1", 30: "S1", 31: "S1" },
  25: { 13: "S1", 14: "S1", 15: "S1", 16: "S1", 17: "S1", 18: "OFF", 19: "OFF", 20: "S1", 21: "S1", 22: "S1", 23: "S1", 24: "S1", 25: "WS1", 26: "OFF", 27: "OFF", 28: "S2", 29: "S2", 30: "S2", 31: "S2" },
  26: { 13: "S1", 14: "S1", 15: "S1", 16: "S1", 17: "S1", 18: "OFF", 19: "OFF", 20: "S1", 21: "S1", 22: "S1", 23: "S1", 24: "OFF", 25: "OFF", 26: "WS2", 27: "S2", 28: "S2", 29: "S2", 30: "S2", 31: "S2" },
  27: { 13: "S2", 14: "S2", 15: "S2", 16: "S2", 17: "S2", 18: "WS2", 19: "OFF", 20: "OFF", 21: "S2", 22: "S2", 23: "S2", 24: "S2", 25: "OFF", 26: "OFF", 27: "S1", 28: "S1", 29: "S1", 30: "S1", 31: "S1" },
  28: { 13: "S1", 14: "S1", 15: "S1", 16: "S1", 17: "S1", 18: "OFF", 19: "WS1", 20: "S1", 21: "OFF", 22: "S1", 23: "S1", 24: "S1", 25: "OFF", 26: "OFF", 27: "S2", 28: "S2", 29: "S2", 30: "S2", 31: "S2" },
  29: { 13: "S2", 14: "S2", 15: "S2", 16: "S2", 17: "S2", 18: "OFF", 19: "OFF", 20: "S2", 21: "S2", 22: "S2", 23: "S2", 24: "S2", 25: "WS1", 26: "OFF", 27: "OFF", 28: "S1", 29: "S1", 30: "S1", 31: "S1" },
  30: { 13: "S2", 14: "S2", 15: "S2", 16: "S2", 17: "S2", 18: "OFF", 19: "WS2", 20: "S2", 21: "OFF", 22: "S2", 23: "S2", 24: "S2", 25: "OFF", 26: "OFF", 27: "S1", 28: "S1", 29: "S1", 30: "S1", 31: "S1" },
  31: { 13: "S1", 14: "S1", 15: "S1", 16: "S1", 17: "S1", 18: "OFF", 19: "OFF", 20: "S1", 21: "S1", 22: "S1", 23: "S1", 24: "OFF", 25: "OFF", 26: "WS1", 27: "S2", 28: "S2", 29: "S2", 30: "S2", 31: "S2" },
  32: { 13: "S1", 14: "S1", 15: "S1", 16: "S1", 17: "S1", 18: "OFF", 19: "OFF", 20: "S1", 21: "S1", 22: "S1", 23: "S1", 24: "OFF", 25: "OFF", 26: "WS2", 27: "S2", 28: "S2", 29: "S2", 30: "S2", 31: "S2" },
};

function deriveFlags(role) {
  return {
    isManager: role === "Sr. Manager" || role === "Manager",
    isLead:    role.startsWith("Lead"),
    isSenior:  role === "Sr. Data Engineer",
    fixedShift: role === "Sr. Manager" ? "GEN" : undefined,
  };
}


const DESIGNATION_BY_ID = {
  1: "SPM", 2: "SPM", 3: "SPM",
  4: "M", 5: "M", 17: "M",
  6: "SA", 7: "SA", 8: "SA", 19: "SA",
  20: "PA", 25: "PA", 28: "PA",
  9: "A", 10: "A", 11: "A", 12: "A", 13: "A", 14: "A", 15: "A", 16: "A", 23: "A", 24: "A",
  18: "PAT", 21: "PAT", 22: "PAT", 26: "PAT", 27: "PAT", 29: "PAT", 30: "PAT", 31: "PAT", 32: "PAT",
};
function designationForMember(member) {
  return DESIGNATION_BY_ID[member.id] || member.designation || "A";
}
// Align persisted team data with the updated roster prompt.
// This prevents an old Supabase team snapshot from treating the wrong person as ID 8 / ID 19.
function applyPromptMemberClassification(members) {
  const overrides = {
    7:  { name: "Madhu", role: "Data Engineer", tech: "IDMC", isLead: false, isSenior: false, fixedShift: undefined },
    8:  { name: "Hari Annamalai", role: "Sr. Data Engineer", tech: "IDMC", isLead: false, isSenior: true },
    18: { name: "Harsh Tailor", role: "Data Engineer", tech: "Databricks", isLead: false, isSenior: false, fixedShift: undefined },
    19: { name: "Sathyanarayanan", role: "Sr. Data Engineer", tech: "Oracle", isLead: false, isSenior: true, fixedShift: undefined },
  };

  return members.map(member => {
    const override = overrides[member.id];
    const base = override ? { ...member, ...override } : { ...member };
    base.designation = designationForMember(base);
    if (base.fixedShift === undefined) delete base.fixedShift;
    return base;
  });
}

const EMPTY_FORM = { name: "", tech: "IDMC", role: "Data Engineer", designation: "A", location: "Offshore", city: "", phone: "", pin: "" };

function MemberModal({ member, onSave, onClose }) {
  const [form, setForm] = useState(member
    ? { name: member.name, tech: member.tech, role: member.role, designation: member.designation || designationForMember(member), location: member.location, city: member.city || "", phone: member.phone || "", pin: member.pin || "" }
    : { ...EMPTY_FORM });
  const [err, setErr] = useState("");

  function save() {
    if (!form.name.trim()) { setErr("Name is required."); return; }
    if (!form.pin || form.pin.length < 4) { setErr("PIN must be at least 4 digits."); return; }
    if (!/^\d+$/.test(form.pin)) { setErr("PIN must contain digits only."); return; }
    onSave({ ...form, name: form.name.trim() });
  }

  const overlay = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" };
  const box = { background: "white", borderRadius: "14px", padding: "24px 26px", width: "420px", maxWidth: "94vw", boxShadow: "0 20px 60px rgba(0,0,0,0.22)", border: "1px solid #e2e8f0" };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={box}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
            <i className={`ti ${member ? "ti-edit" : "ti-user-plus"}`} style={{ fontSize: "15px", marginRight: "8px", verticalAlign: "-2px", color: "#1d4ed8" }} aria-hidden="true"></i>
            {member ? "Edit member" : "Add new member"}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#64748b" }}>✕</button>
        </div>

        {[
          ["Full name", "name", "text", null, "Enter full name"],
          ["City", "city", "text", null, "Enter city"],
          ["Contact number", "phone", "tel", null, "+91 98765 43210"],
          ["Technology", "tech", "select", TECHS, null],
          ["Role", "role", "select", ROLES, null],
          ["Designation", "designation", "select", DESIGNATIONS, null],
          ["Location", "location", "select", ["Onsite","Offshore"], null],
          ["PIN (4+ digits)", "pin", "password", null, "e.g. 1234"],
        ].map(([lbl, key, type, opts, ph]) => (
          <div key={key} style={{ marginBottom: "14px" }}>
            <label style={LBL_STYLE}>{lbl}</label>
            {type === "select"
              ? <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={SEL_STYLE}>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              : <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={ph || ""} maxLength={type === "password" ? 8 : undefined}
                  style={{ ...INP_STYLE, letterSpacing: type === "password" ? "4px" : "normal" }} />
            }
          </div>
        ))}

        {/* Role flags preview */}
        <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", fontSize: "11px", color: "#64748b" }}>
          <strong>Auto-detected flags: </strong>
          {(() => {
            const f = deriveFlags(form.role);
            const tags = [];
            if (f.isManager) tags.push("Manager");
            if (f.isLead)    tags.push("Lead");
            if (f.isSenior)  tags.push("Senior");
            if (f.fixedShift) tags.push(`Fixed shift: ${f.fixedShift}`);
            return tags.length ? tags.join(" · ") : "Data Engineer (no special flags)";
          })()}
        </div>

        {err && <p style={{ fontSize: "12px", color: "#dc2626", marginBottom: "10px" }}>{err}</p>}

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", color: "#374151", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
          <button onClick={save} style={{ padding: "8px 22px", borderRadius: "8px", border: "none", background: "#1d4ed8", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
            {member ? "Save changes" : "Add member"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ member, onConfirm, onClose }) {
  const overlay = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" };
  const box = { background: "white", borderRadius: "14px", padding: "24px 26px", width: "360px", maxWidth: "94vw", boxShadow: "0 20px 60px rgba(0,0,0,0.22)" };
  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={box}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <i className="ti ti-trash" style={{ fontSize: "20px", color: "#dc2626" }} aria-hidden="true"></i>
        </div>
        <p style={{ textAlign: "center", fontWeight: 700, fontSize: "15px", marginBottom: "8px", color: "#0f172a" }}>Remove {member.name}?</p>
        <p style={{ textAlign: "center", fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>
          This removes them from the roster permanently. All their shift assignments will be cleared.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: "8px 22px", borderRadius: "8px", border: "none", background: "#dc2626", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Remove</button>
        </div>
      </div>
    </div>
  );
}


const DEFAULT_CONDITIONS = {
  onsiteCount: 3, offshoreCount: 29, minDaysPerMonth: 21, maxDaysPerWeek: 5,
  weekdayShift1: { istStart: "06:00", istEnd: "15:00" },
  weekdayShift2: { istStart: "14:00", istEnd: "23:00" },
  weekendShift1: { istStart: "06:00", istEnd: "15:00" },
  weekendShift2: { istStart: "14:00", istEnd: "23:00" },
  weekOffPatterns: ["Sat/Sun"],
  noNightShiftOffshore: true, noWeekendForLeads: true, alternateWeekends: true, seniorJuniorMix: true,
  techCoveragePerShift: { IDMC: 1, Databricks: 1, Oracle: 1 },
};

const SHIFT_COLORS = {
  S1:      { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
  S2:      { bg: "#dcfce7", text: "#166534", border: "#22c55e" },
  GEN:     { bg: "#ede9fe", text: "#4c1d95", border: "#7c3aed" },
  "G-PST": { bg: "#ede9fe", text: "#4c1d95", border: "#7c3aed" },
  WS1:     { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
  WS2:     { bg: "#fee2e2", text: "#991b1b", border: "#ef4444" },
  OFF:     { bg: "#f3f4f6", text: "#6b7280", border: "#d1d5db" },
};

const TECH_COLORS = {
  IDMC: "#1d4ed8", Databricks: "#15803d", Oracle: "#b91c1c", "Project Management": "#6d28d9",
};

// Browser dark-theme guard. The app is intentionally light themed; this prevents
// Chrome/Edge/Safari from auto-darkening native date/time/password/select controls.
const LIGHT_THEME_CSS = `
  :root { color-scheme: light; }
  html, body, #root { background: #ffffff; color: #1e293b; }
  input, select, textarea, button { color-scheme: light; }
  input[type="date"], input[type="time"], input[type="password"], input[type="text"], input[type="number"], input[type="tel"] {
    background-color: #ffffff;
    color: #1e293b;
  }
  select { background-color: #ffffff; color: #1e293b; }
`;
function LightThemeGuard() {
  return <style>{LIGHT_THEME_CSS}</style>;
}

function generateRoster(year, month, conditions, members, options = {}) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = i + 1;
    const d = new Date(year, month - 1, date);
    return {
      date,
      dayOfWeek: d.getDay(),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    };
  });

  // =====================================================
  // UPDATED ROSTER CONSTANTS - single source of truth
  // =====================================================
  const MANAGEMENT = {
    SENIOR_MANAGER: [1],
    ONSITE_MANAGERS: [2, 3, 4],
  };
  const OFFSHORE_GEN = [];
  const LEADS_IDS = [5, 6, 7, 17];
  const WEEKEND_EXEMPT_IDS = [8,19];

  // Combo groups from the supplied prompt. Do not alter these IDs in rotation logic.
  const COMBO1_IDS = [7,  10, 11, 13, 14, 17, 19, 21, 23, 25, 26, 28, 31, 32];
  const COMBO2_IDS = [5, 6, 8, 9, 12, 15, 16, 18, 20, 22, 24, 27, 29, 30];
  const COMBO1_NON_LEADS = [10, 11, 13, 14,  21, 23, 25, 26, 28, 31, 32];
  const COMBO2_NON_LEADS = [ 9, 12, 15, 16, 18, 20, 22, 24, 27, 29, 30];
  const WEEKEND_ELIGIBLE_IDS = [...COMBO1_NON_LEADS, ...COMBO2_NON_LEADS];

  // Flexible weekend staffing. Auto-generation uses the minimum coverage required
  // while enforcing designation mix for every weekend shift.
  // Manual/future coverage can be increased up to 4 per shift without failing validation.
  const WEEKEND_MIN_STAFFING = { WS1: 2, WS2: 2 };
  const WEEKEND_MAX_STAFFING = { WS1: 4, WS2: 4 };
  const WEEKEND_AUTO_STAFFING = { WS1: 2, WS2: 2 };
  // Each generated weekend shift starts with one A/PA; second slot prefers PAT,
  // but can fall back to another A/PA if needed to preserve coverage/equal workdays.
  const WEEKEND_SLOT_SEQUENCE = [
    { shift: "WS2", requiredGroup: "A_PA" },
    { shift: "WS2", requiredGroup: "PAT" },
    { shift: "WS1", requiredGroup: "A_PA" },
    { shift: "WS1", requiredGroup: "PAT" },
  ];

  const idSet = ids => new Set(ids);
  const seniorManagerIds = idSet(MANAGEMENT.SENIOR_MANAGER);
  const onsiteManagerIds = idSet(MANAGEMENT.ONSITE_MANAGERS);
  const offshoreGenIds = idSet(OFFSHORE_GEN);
  const leadIds = idSet(LEADS_IDS);
  const weekendExemptIds = idSet(WEEKEND_EXEMPT_IDS);
  const combo1Ids = idSet(COMBO1_IDS);
  const combo2Ids = idSet(COMBO2_IDS);
  const weekendEligibleIds = idSet(WEEKEND_ELIGIBLE_IDS);

  const weekendDays = days.filter(d => d.dayOfWeek === 6 || d.dayOfWeek === 0);
  const TARGET_OFF_DAYS = weekendDays.length;
  const TARGET_WORK_DAYS = daysInMonth - TARGET_OFF_DAYS;

  function memberById(id) {
    return members.find(m => m.id === id);
  }

  function isHardFixed(member) {
    return seniorManagerIds.has(member.id) || onsiteManagerIds.has(member.id) || offshoreGenIds.has(member.id);
  }

  function isNeverWeekend(member) {
    return isHardFixed(member) || leadIds.has(member.id) || weekendExemptIds.has(member.id);
  }

  function isWeekendEligible(member) {
    return weekendEligibleIds.has(member.id) && !isNeverWeekend(member);
  }

  function startOfWeekMonday(dt) {
    const d = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const offset = (d.getDay() + 6) % 7; // Monday=0, Sunday=6
    d.setDate(d.getDate() - offset);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function firstMondayOnOrAfter(dt) {
    const d = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const daysUntilMonday = (8 - d.getDay()) % 7;
    d.setDate(d.getDate() + daysUntilMonday);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getWeekendAnchor(date) {
    const day = days.find(d => d.date === date);
    if (!day || (day.dayOfWeek !== 6 && day.dayOfWeek !== 0)) return null;
    return day.dayOfWeek === 6 ? date : date - 1;
  }

  function getWeekendDays(anchor) {
    return weekendDays.filter(d => getWeekendAnchor(d.date) === anchor);
  }

  function getWeekendAnchors() {
    return [...new Set(weekendDays.map(d => getWeekendAnchor(d.date)).filter(v => v !== null))]
      .sort((a, b) => a - b);
  }

  function getSeedRosterForMonth(seedYear, seedMonth) {
    if (seedYear === 2026 && seedMonth === 7) return JULY_2026_SEED_ROSTER;
    return null;
  }

  function deriveSeededMonthLastWeekendWorkers(seedYear, seedMonth) {
    const seededRoster = getSeedRosterForMonth(seedYear, seedMonth);
    if (!seededRoster) return null;

    const seedStartDay = seedYear === ROSTER_START.year && seedMonth === ROSTER_START.month
      ? (ROSTER_START.day || 1)
      : 1;
    const seedDaysInMonth = new Date(seedYear, seedMonth, 0).getDate();
    const seedWeekendDays = Array.from({ length: seedDaysInMonth }, (_, i) => {
      const date = i + 1;
      const d = new Date(seedYear, seedMonth - 1, date);
      return { date, dayOfWeek: d.getDay() };
    }).filter(d => d.date >= seedStartDay && (d.dayOfWeek === 6 || d.dayOfWeek === 0));

    if (seedWeekendDays.length === 0) return new Set();

    const seedAnchor = d => d.dayOfWeek === 6 ? d.date : d.date - 1;
    const lastAnchor = Math.max(...seedWeekendDays.map(seedAnchor));
    const lastWeekendDays = seedWeekendDays.filter(d => seedAnchor(d) === lastAnchor);
    const workers = new Set();

    members.forEach(member => {
      if (lastWeekendDays.some(d => isWeekendShift(seededRoster?.[member.id]?.[d.date]))) {
        workers.add(member.id);
      }
    });

    return workers;
  }

  function derivePreviousMonthLastWeekendWorkers() {
    if (options.skipCrossMonthHistory) return new Set();

    const prev = new Date(year, month - 2, 1);
    const prevYear = prev.getFullYear();
    const prevMonth = prev.getMonth() + 1;

    const seededWorkers = deriveSeededMonthLastWeekendWorkers(prevYear, prevMonth);
    if (seededWorkers) return seededWorkers;

    if (
      year === ROSTER_START.year &&
      month === ROSTER_START.month
    ) {
      return new Set();
    }

    const prevResult = generateRoster(prevYear, prevMonth, conditions, members, { skipCrossMonthHistory: true });
    const prevWeekendDays = prevResult.days.filter(d => d.dayOfWeek === 6 || d.dayOfWeek === 0);
    if (prevWeekendDays.length === 0) return new Set();

    const prevAnchor = d => d.dayOfWeek === 6 ? d.date : d.date - 1;
    const lastAnchor = Math.max(...prevWeekendDays.map(prevAnchor));
    const lastWeekendDays = prevWeekendDays.filter(d => prevAnchor(d) === lastAnchor);
    const workers = new Set();

    members.forEach(member => {
      if (lastWeekendDays.some(d => isWeekendShift(prevResult.roster?.[member.id]?.[d.date]))) {
        workers.add(member.id);
      }
    });

    return workers;
  }

  const previousMonthLastWeekendWorkers = derivePreviousMonthLastWeekendWorkers();

  function applySeededRosterForCurrentMonth(sourceRoster) {
    const seededRoster = getSeedRosterForMonth(year, month);
    if (!seededRoster) return;

    const seedStartDay = year === ROSTER_START.year && month === ROSTER_START.month
      ? (ROSTER_START.day || 1)
      : 1;

    members.forEach(member => {
      days.forEach(d => {
        const seededShift = seededRoster?.[member.id]?.[d.date];
        if (d.date >= seedStartDay && seededShift) {
          sourceRoster[member.id][d.date] = seededShift;
        }
      });
    });
  }

  // Shift rotation changes only once every 2 full calendar weeks and only on Mondays.
  // Roster starts from the seeded July 13, 2026 production schedule.
  // Bi-weekly rotation continues from July, so August inherits the active block from late July.
  function getBiWeekBlockByMonthWeek(date) {
    const currentDate = new Date(year, month - 1, date);
    const rosterStartDate = new Date(ROSTER_START.year, ROSTER_START.month - 1, ROSTER_START.day || 1);
    const firstRotationMonday = firstMondayOnOrAfter(rosterStartDate);

    if (currentDate < firstRotationMonday) return 0;

    const currentWeekMonday = startOfWeekMonday(currentDate);
    const weeksSinceFirstRotationMonday = Math.floor(
      (currentWeekMonday - firstRotationMonday) / (7 * 24 * 60 * 60 * 1000)
    );

    return Math.floor(weeksSinceFirstRotationMonday / 2) % 2;
  }

  function weekdayShiftFor(member, date) {
    if (combo1Ids.has(member.id)) {
      return getBiWeekBlockByMonthWeek(date) === 0 ? "S1" : "S2";
    }
    if (combo2Ids.has(member.id)) {
      return getBiWeekBlockByMonthWeek(date) === 0 ? "S2" : "S1";
    }
    return "S1";
  }

  function isWeekendShift(shift) {
    return shift === "WS1" || shift === "WS2";
  }

  function designationGroup(member) {
    const d = member.designation || designationForMember(member);
    if (d === "PAT") return "PAT";
    if (d === "A" || d === "PA") return "A_PA";
    return "OTHER";
  }

  function hasRequiredDesignationMix(workers) {
    if (workers.length < 2) return false;
    // The business rule is to avoid all-PAT weekend shifts.
    // A/PA + PAT is preferred, but A + PA is also valid when PAT availability is constrained.
    return !workers.every(w => designationGroup(w) === "PAT");
  }

  function shiftStartEnd(shift, date) {
    if (!shift || shift === "OFF") return null;
    const cfg = {
      S1: conditions?.weekdayShift1 || { istStart: "06:00", istEnd: "15:00" },
      S2: conditions?.weekdayShift2 || { istStart: "14:00", istEnd: "23:00" },
      GEN: { istStart: "09:00", istEnd: "18:00" },
      "G-PST": { istStart: "21:00", istEnd: "06:00" },
      WS1: conditions?.weekendShift1 || { istStart: "06:00", istEnd: "15:00" },
      WS2: conditions?.weekendShift2 || { istStart: "14:00", istEnd: "23:00" },
    }[shift];
    if (!cfg) return null;
    const [sh, sm] = cfg.istStart.split(":").map(Number);
    const [eh, em] = cfg.istEnd.split(":").map(Number);
    const start = new Date(year, month - 1, date, sh, sm, 0, 0);
    const end = new Date(year, month - 1, date, eh, em, 0, 0);
    if (end <= start) end.setDate(end.getDate() + 1);
    return { start, end };
  }

  function hasMinimumRest(memberId, date, shift, sourceRoster) {
    if (!shift || shift === "OFF") return true;
    const current = shiftStartEnd(shift, date);
    if (!current) return true;
    for (let d = date - 1; d >= 1; d--) {
      const prevShift = sourceRoster?.[memberId]?.[d];
      if (!prevShift || prevShift === "OFF") continue;
      const prev = shiftStartEnd(prevShift, d);
      if (!prev) return true;
      return (current.start - prev.end) / (1000 * 60 * 60) >= 11;
    }
    return true;
  }

  function hasMinimumFutureRest(memberId, date, shift, sourceRoster) {
    if (!shift || shift === "OFF") return true;
    const current = shiftStartEnd(shift, date);
    if (!current) return true;
    for (let d = date + 1; d <= daysInMonth; d++) {
      const nextShift = sourceRoster?.[memberId]?.[d];
      if (!nextShift || nextShift === "OFF") continue;
      const next = shiftStartEnd(nextShift, d);
      if (!next) return true;
      return (next.start - current.end) / (1000 * 60 * 60) >= 11;
    }
    return true;
  }

  function hasWeekendWorkInAnchor(memberId, anchor, sourceRoster) {
    return getWeekendDays(anchor).some(d => isWeekendShift(sourceRoster?.[memberId]?.[d.date]));
  }

  function canReceiveWeekend(member, date, shift, sourceRoster) {
    if (!isWeekendEligible(member)) return false;
    if (sourceRoster?.[member.id]?.[date] !== "OFF") return false;
    if (!isWeekendShift(shift)) return false;
    if ((weekendWorkCount?.[member.id] || 0) >= weekendMaxTarget) return false;

    const anchor = getWeekendAnchor(date);
    const anchors = getWeekendAnchors();
    const idx = anchors.indexOf(anchor);

    // Cross-month weekend history: anyone who worked the previous month's last weekend
    // is blocked from the first weekend of this month.
    if (idx === 0 && previousMonthLastWeekendWorkers.has(member.id)) return false;
    const currentWeekendDays = getWeekendDays(anchor);

    // Never work Saturday and Sunday in the same weekend.
    if (currentWeekendDays.some(d => d.date !== date && isWeekendShift(sourceRoster?.[member.id]?.[d.date]))) {
      return false;
    }

    // No consecutive weekend duty when mathematically possible.
    const prevAnchor = idx > 0 ? anchors[idx - 1] : null;
    const nextAnchor = idx >= 0 && idx < anchors.length - 1 ? anchors[idx + 1] : null;
    if (prevAnchor !== null && hasWeekendWorkInAnchor(member.id, prevAnchor, sourceRoster)) return false;
    if (nextAnchor !== null && hasWeekendWorkInAnchor(member.id, nextAnchor, sourceRoster)) return false;

    // Rest must be valid both from the previous worked shift and into the next worked shift.
    return (
      hasMinimumRest(member.id, date, shift, sourceRoster) &&
      hasMinimumFutureRest(member.id, date, shift, sourceRoster)
    );
  }

  const roster = {};
  members.forEach(member => {
    roster[member.id] = {};
    days.forEach(d => {
      const dow = d.dayOfWeek;
      if (seniorManagerIds.has(member.id)) {
        roster[member.id][d.date] = d.isWeekend ? "OFF" : "GEN";
      } else if (onsiteManagerIds.has(member.id)) {
        roster[member.id][d.date] = d.isWeekend ? "OFF" : "G-PST";
      } else if (offshoreGenIds.has(member.id)) {
        roster[member.id][d.date] = d.isWeekend ? "OFF" : "GEN";
      } else if (dow === 6 || dow === 0) {
        roster[member.id][d.date] = "OFF";
      } else {
        roster[member.id][d.date] = weekdayShiftFor(member, d.date);
      }
    });
  });

  // =====================================================
  // WEEKEND COVERAGE PLANNER
  // =====================================================
  const eligible = WEEKEND_ELIGIBLE_IDS.map(memberById).filter(Boolean).filter(isWeekendEligible);
  const weekendWorkCount = Object.fromEntries(eligible.map(m => [m.id, 0]));
  const weekendNightCount = Object.fromEntries(eligible.map(m => [m.id, 0]));
  const totalWeekendSlots = weekendDays.length * (WEEKEND_AUTO_STAFFING.WS1 + WEEKEND_AUTO_STAFFING.WS2);
  const totalWeekendCapacity = weekendDays.length * (WEEKEND_MAX_STAFFING.WS1 + WEEKEND_MAX_STAFFING.WS2);
  const weekendMinTarget = Math.floor(totalWeekendSlots / Math.max(eligible.length, 1));
  const weekendMaxTarget = Math.max(Math.ceil(totalWeekendSlots / Math.max(eligible.length, 1)), 2);
  const weekendFairMinTarget = Math.max(
    weekendMinTarget,
    Math.min(2, weekendMaxTarget, Math.floor(totalWeekendCapacity / Math.max(eligible.length, 1)))
  );

  function markWeekendPattern(memberId, date) {
    const day = days.find(d => d.date === date);
    if (!day) return;
    if (day.dayOfWeek === 6) {
      // Saturday duty => Sun/Mon OFF.
      if (date + 1 <= daysInMonth) roster[memberId][date + 1] = "OFF";
      if (date + 2 <= daysInMonth) roster[memberId][date + 2] = "OFF";
    } else if (day.dayOfWeek === 0) {
      // Sunday duty => Fri/Sat OFF.
      if (date - 2 >= 1) roster[memberId][date - 2] = "OFF";
      if (date - 1 >= 1) roster[memberId][date - 1] = "OFF";
    }
  }

  function sortWeekendCandidates(candidates, date, shift) {
    return [...candidates].sort((a, b) => {
      const aCnt = weekendWorkCount[a.id] || 0;
      const bCnt = weekendWorkCount[b.id] || 0;
      if (aCnt !== bCnt) return aCnt - bCnt;
      const aNight = weekendNightCount[a.id] || 0;
      const bNight = weekendNightCount[b.id] || 0;
      if (shift === "WS2" && aNight !== bNight) return aNight - bNight;
      const aSen = a.isSenior ? 0 : 1;
      const bSen = b.isSenior ? 0 : 1;
      if (aSen !== bSen) return aSen - bSen;
      return a.id - b.id;
    });
  }

  function assignWeekendSlot(day, shift, allowConsecutiveFallback = false, requiredDesignationGroup = null) {
    const baseCandidates = eligible.filter(m => canReceiveWeekend(m, day.date, shift, roster));
    const strictCandidates = requiredDesignationGroup
      ? baseCandidates.filter(m => designationGroup(m) === requiredDesignationGroup)
      : baseCandidates;
    // For PAT-preferred slot, fall back to any eligible non-conflicting resource if PAT is unavailable.
    // The validation still prevents an all-PAT shift.
    let candidates = strictCandidates.length > 0 || requiredDesignationGroup !== "PAT"
      ? strictCandidates
      : baseCandidates;

    if (candidates.length === 0 && allowConsecutiveFallback) {
      // Fallback keeps fixed-person exclusions and same-weekend protection, but permits the single
      // unavoidable consecutive-weekend overlap when the eligible pool is smaller than required capacity.
      const anchor = getWeekendAnchor(day.date);
      candidates = eligible.filter(m => {
        if (roster[m.id]?.[day.date] !== "OFF") return false;
        const sameWeekendConflict = getWeekendDays(anchor).some(d => d.date !== day.date && isWeekendShift(roster[m.id]?.[d.date]));
        if (sameWeekendConflict) return false;
        return hasMinimumRest(m.id, day.date, shift, roster);
      });
    }

    const chosen = sortWeekendCandidates(candidates, day.date, shift)[0];
    if (!chosen) return false;

    markWeekendPattern(chosen.id, day.date);
    roster[chosen.id][day.date] = shift;
    weekendWorkCount[chosen.id] = (weekendWorkCount[chosen.id] || 0) + 1;
    if (shift === "WS2") weekendNightCount[chosen.id] = (weekendNightCount[chosen.id] || 0) + 1;
    return true;
  }

  weekendDays.forEach(day => {
    WEEKEND_SLOT_SEQUENCE.forEach(slot => {
      const shiftSpec = typeof slot === "string" ? { shift: slot, requiredGroup: null } : slot;
      assignWeekendSlot(day, shiftSpec.shift, false, shiftSpec.requiredGroup);
    });
  });

  // =====================================================
  // WEEKEND FAIRNESS TOP-UP
  // Runs after mandatory weekend coverage and before fixed-rule re-apply/monthly normalization.
  // It does not move existing logic or assignments; it only adds WS1/WS2 up to max staffing
  // so eligible members do not remain with only 1 weekend shift when 2 is possible.
  // =====================================================
  function weekendStaffCount(date, shift) {
    return members.filter(m => roster[m.id]?.[date] === shift).length;
  }

  function canAddWeekendTopUp(member, date, shift) {
    if (!isWeekendEligible(member)) return false;
    if (roster[member.id]?.[date] !== "OFF") return false;
    if ((weekendWorkCount[member.id] || 0) >= weekendMaxTarget) return false;
    if (weekendStaffCount(date, shift) >= WEEKEND_MAX_STAFFING[shift]) return false;
    const anchor = getWeekendAnchor(date);
    const anchors = getWeekendAnchors();
    const idx = anchors.indexOf(anchor);
    if (idx === 0 && previousMonthLastWeekendWorkers.has(member.id)) return false;
    if (getWeekendDays(anchor).some(d => d.date !== date && isWeekendShift(roster[member.id]?.[d.date]))) return false;
    return hasMinimumRest(member.id, date, shift, roster) && hasMinimumFutureRest(member.id, date, shift, roster);
  }

  function addWeekendTopUp(member) {
    const slots = [];
    weekendDays.forEach(day => {
      ["WS1", "WS2"].forEach(shift => {
        if (canAddWeekendTopUp(member, day.date, shift)) {
          slots.push({ date: day.date, shift, staff: weekendStaffCount(day.date, shift) });
        }
      });
    });
    slots.sort((a, b) => {
      if (a.staff !== b.staff) return a.staff - b.staff;
      if ((weekendNightCount[member.id] || 0) > 0 && a.shift !== b.shift) return a.shift === "WS1" ? -1 : 1;
      if (a.date !== b.date) return a.date - b.date;
      return a.shift.localeCompare(b.shift);
    });
    const chosen = slots[0];
    if (!chosen) return false;
    markWeekendPattern(member.id, chosen.date);
    roster[member.id][chosen.date] = chosen.shift;
    weekendWorkCount[member.id] = (weekendWorkCount[member.id] || 0) + 1;
    if (chosen.shift === "WS2") weekendNightCount[member.id] = (weekendNightCount[member.id] || 0) + 1;
    return true;
  }

  for (let pass = 0; pass < 10; pass++) {
    const underServed = eligible
      .filter(m => (weekendWorkCount[m.id] || 0) < weekendFairMinTarget)
      .sort((a, b) => {
        const aCnt = weekendWorkCount[a.id] || 0;
        const bCnt = weekendWorkCount[b.id] || 0;
        if (aCnt !== bCnt) return aCnt - bCnt;
        return a.id - b.id;
      });
    if (underServed.length === 0) break;
    let changed = false;
    underServed.forEach(member => {
      while ((weekendWorkCount[member.id] || 0) < weekendFairMinTarget) {
        if (!addWeekendTopUp(member)) break;
        changed = true;
      }
    });
    if (!changed) break;
  }

  // Re-apply fixed and never-weekend rules after weekend pattern changes.
  members.forEach(member => {
    days.forEach(d => {
      if (seniorManagerIds.has(member.id)) roster[member.id][d.date] = d.isWeekend ? "OFF" : "GEN";
      if (onsiteManagerIds.has(member.id)) roster[member.id][d.date] = d.isWeekend ? "OFF" : "G-PST";
      if (offshoreGenIds.has(member.id)) roster[member.id][d.date] = d.isWeekend ? "OFF" : "GEN";
      if ((leadIds.has(member.id) || weekendExemptIds.has(member.id)) && d.isWeekend) roster[member.id][d.date] = "OFF";
    });
  });

  // =====================================================
  // MONTHLY COUNT NORMALIZER
  // Only S1/S2 weekdays are changed. Fixed GEN/G-PST and WS1/WS2 are protected.
  // =====================================================
  function getOffDays(memberId) {
    return days.filter(d => roster[memberId]?.[d.date] === "OFF").length;
  }

  function getWorkDays(memberId) {
    return daysInMonth - getOffDays(memberId);
  }

  function hasAtLeast2OffInEveryRolling7(memberId) {
    if (daysInMonth < 7) return true;
    for (let start = 1; start <= daysInMonth - 6; start++) {
      const offCnt = days
        .filter(d => d.date >= start && d.date <= start + 6)
        .filter(d => roster[memberId]?.[d.date] === "OFF").length;
      if (offCnt < 2) return false;
    }
    return true;
  }

  function wouldKeepRollingRest(memberId, date, newShift) {
    const old = roster[memberId]?.[date];
    roster[memberId][date] = newShift;
    const ok = hasAtLeast2OffInEveryRolling7(memberId) && hasMinimumRest(memberId, date, newShift, roster);
    roster[memberId][date] = old;
    return ok;
  }

  function isWorkingShiftForCount(memberId, date) {
    const shift = roster[memberId]?.[date];
    return shift && shift !== "OFF";
  }

  function getWorkStreak(memberId, date) {
    if (!isWorkingShiftForCount(memberId, date)) return { start: date, end: date, length: 0 };
    let start = date;
    let end = date;
    while (start > 1 && isWorkingShiftForCount(memberId, start - 1)) start--;
    while (end < daysInMonth && isWorkingShiftForCount(memberId, end + 1)) end++;
    return { start, end, length: end - start + 1 };
  }

  function findExtraWorkdayOffCandidate(member) {
    const candidates = days
      .filter(d => {
        const shift = roster[member.id]?.[d.date];
        return d.dayOfWeek >= 1 && d.dayOfWeek <= 5 && (shift === "S1" || shift === "S2");
      })
      .map(d => {
        const streak = getWorkStreak(member.id, d.date);
        const center = (streak.start + streak.end) / 2;
        return { date: d.date, streakLength: streak.length, distanceFromCenter: Math.abs(d.date - center) };
      });

    const sixDayCandidates = candidates.filter(c => c.streakLength >= 6);
    const pool = sixDayCandidates.length > 0 ? sixDayCandidates : candidates;
    pool.sort((a, b) => {
      if (b.streakLength !== a.streakLength) return b.streakLength - a.streakLength;
      if (a.distanceFromCenter !== b.distanceFromCenter) return a.distanceFromCenter - b.distanceFromCenter;
      return b.date - a.date;
    });
    return pool[0]?.date || null;
  }

  function normalizeMonthlyCount(member) {
    // FINAL HARD RULE: every resource must have exactly TARGET_WORK_DAYS for the month.
    // Fixed/never-weekend resources naturally match Mon-Fri workdays; weekend-eligible
    // resources are repaired only by changing weekday S1/S2 cells, never GEN/G-PST/WS1/WS2.
    if (isHardFixed(member) || leadIds.has(member.id) || weekendExemptIds.has(member.id)) {
      return;
    }

    let workCount = getWorkDays(member.id);

    while (workCount > TARGET_WORK_DAYS) {
      const candidateDate = findExtraWorkdayOffCandidate(member);
      if (!candidateDate) break;
      roster[member.id][candidateDate] = "OFF";
      workCount--;
    }

    while (workCount < TARGET_WORK_DAYS) {
      const candidate = [...days].reverse().find(d => {
        if (d.dayOfWeek < 1 || d.dayOfWeek > 5) return false;
        if (roster[member.id]?.[d.date] !== "OFF") return false;
        const natural = weekdayShiftFor(member, d.date);
        if (natural !== "S1" && natural !== "S2") return false;
        return wouldKeepRollingRest(member.id, d.date, natural);
      });
      if (!candidate) break;
      roster[member.id][candidate.date] = weekdayShiftFor(member, candidate.date);
      workCount++;
    }
  }

  members.forEach(normalizeMonthlyCount);

  // Final equality pass: if a month-start/month-end weekend compensation still leaves
  // someone off-target, repair only S1/S2 weekdays until exact monthly count is met.
  for (let pass = 0; pass < 5; pass++) {
    let changed = false;
    members.forEach(member => {
      if (isHardFixed(member) || leadIds.has(member.id) || weekendExemptIds.has(member.id)) return;
      let workCount = getWorkDays(member.id);
      while (workCount > TARGET_WORK_DAYS) {
        const candidateDate = findExtraWorkdayOffCandidate(member);
        if (!candidateDate) break;
        roster[member.id][candidateDate] = "OFF";
        workCount--;
        changed = true;
      }
      while (workCount < TARGET_WORK_DAYS) {
        const candidate = [...days].reverse().find(d => {
          if (d.dayOfWeek < 1 || d.dayOfWeek > 5) return false;
          if (roster[member.id]?.[d.date] !== "OFF") return false;
          const natural = weekdayShiftFor(member, d.date);
          if (natural !== "S1" && natural !== "S2") return false;
          return hasMinimumRest(member.id, d.date, natural, roster);
        });
        if (!candidate) break;
        roster[member.id][candidate.date] = weekdayShiftFor(member, candidate.date);
        workCount++;
        changed = true;
      }
    });
    if (!changed) break;
  }

  // Apply supplied production seed at the end so July 13-31 exactly matches the attached manual roster.
  // Future months still use the seed only as history and continue to generate normally.
  applySeededRosterForCurrentMonth(roster);

  // =====================================================
  // FINAL VALIDATION REPORT - logs only, never throws/crashes UI
  // =====================================================
  function collectValidationIssues() {
    const issues = [];

    members.forEach(member => {
      if (offshoreGenIds.has(member.id)) {
        days.forEach(d => {
          const shift = roster[member.id]?.[d.date];
          if ((!d.isWeekend && shift !== "GEN") || (d.isWeekend && shift !== "OFF")) {
            issues.push(`ID ${member.id} must be GEN weekdays and OFF weekends, found ${shift} on day ${d.date}`);
          }
        });
      }

      if (weekendExemptIds.has(member.id) || leadIds.has(member.id)) {
        weekendDays.forEach(d => {
          if (roster[member.id]?.[d.date] !== "OFF") {
            issues.push(`${member.name} must be OFF on weekend day ${d.date}`);
          }
        });
      }

      const anchors = getWeekendAnchors();
      anchors.forEach((anchor, idx) => {
        const worked = getWeekendDays(anchor).filter(d => isWeekendShift(roster[member.id]?.[d.date]));
        if (worked.length > 1) {
          issues.push(`${member.name} works both days in weekend anchored ${anchor}`);
        }
        if (worked.length === 1 && idx > 0) {
          const prevWorked = hasWeekendWorkInAnchor(member.id, anchors[idx - 1], roster);
          if (prevWorked) issues.push(`${member.name} has consecutive weekend duty on weekend anchored ${anchor}`);
        }
      });

    });

    members.forEach(member => {
      const count = getWorkDays(member.id);
      if (count !== TARGET_WORK_DAYS) {
        issues.push(`${member.name} monthly working-day count mismatch: ${count}, expected exactly ${TARGET_WORK_DAYS}`);
      }
    });

    eligible.forEach(member => {
      const count = weekendWorkCount[member.id] || 0;
      if (count < weekendFairMinTarget || count > weekendMaxTarget) {
        issues.push(`${member.name} weekend count out of fair range: ${count}, expected ${weekendFairMinTarget}-${weekendMaxTarget}`);
      }
    });

    weekendDays.forEach(d => {
      const ws1 = members.filter(m => roster[m.id]?.[d.date] === "WS1").length;
      const ws2 = members.filter(m => roster[m.id]?.[d.date] === "WS2").length;
      const ws1Invalid = ws1 < WEEKEND_MIN_STAFFING.WS1 || ws1 > WEEKEND_MAX_STAFFING.WS1;
      const ws2Invalid = ws2 < WEEKEND_MIN_STAFFING.WS2 || ws2 > WEEKEND_MAX_STAFFING.WS2;
      if (ws1Invalid || ws2Invalid) {
        issues.push(`Weekend staffing mismatch on day ${d.date}: WS1=${ws1}, WS2=${ws2}, expected WS1=${WEEKEND_MIN_STAFFING.WS1}-${WEEKEND_MAX_STAFFING.WS1}, WS2=${WEEKEND_MIN_STAFFING.WS2}-${WEEKEND_MAX_STAFFING.WS2}`);
      }
      const ws1Workers = members.filter(m => roster[m.id]?.[d.date] === "WS1");
      const ws2Workers = members.filter(m => roster[m.id]?.[d.date] === "WS2");
      if (ws1Workers.length > 0 && !hasRequiredDesignationMix(ws1Workers)) {
        issues.push(`WS1 designation mix violation on day ${d.date}: must not be staffed only with PAT resources`);
      }
      if (ws2Workers.length > 0 && !hasRequiredDesignationMix(ws2Workers)) {
        issues.push(`WS2 designation mix violation on day ${d.date}: must not be staffed only with PAT resources`);
      }
    });

    // Rest check across consecutive worked shifts.
    members.forEach(member => {
      for (let date = 2; date <= daysInMonth; date++) {
        const shift = roster[member.id]?.[date];
        if (shift && shift !== "OFF" && !hasMinimumRest(member.id, date, shift, roster)) {
          issues.push(`${member.name} has less than 11h rest before day ${date} ${shift}`);
        }
      }
    });

    return issues;
  }

  const finalIssues = collectValidationIssues();
  if (finalIssues.length > 0) {
    console.warn(
      `Roster generated with validation warnings. Some supplied constraints may be mathematically conflicting.\n${finalIssues.join("\n")}`
    );
  }

  return { roster, days };
}


function calcStats(roster, days, members) {
  const stats = {};
  members.forEach(m => {
    const shifts = days.map(d => roster[m.id]?.[d.date] || "OFF");
    const workDays = shifts.filter(s => s !== "OFF").length;
    const s1    = shifts.filter(s => s === "S1").length;
    const s2    = shifts.filter(s => s === "S2").length;
    const we    = shifts.filter(s => s === "WS1" || s === "WS2").length;
    const night = shifts.filter(s => s === "WS2").length;
    stats[m.id] = { workDays, s1, s2, we, night, offDays: days.length - workDays };
  });
  return stats;
}

// Shared helper: a filter value is "active" when it's a non-empty array (multi-select)
function isFilterActive(v) {
  return Array.isArray(v) ? v.length > 0 : v !== "All";
}

// Clean dropdown — renders in a portal-style fixed position to avoid table clipping
// Multi-select: `value` is an array of selected options (empty array = "All", no filter).
function FilterSelect({ label, options, value, onChange, colorMap }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const selected = Array.isArray(value) ? value : []; // tolerate legacy "All" string values
  const active = selected.length > 0;
  const realOptions = options.filter(o => o !== "All");

  useEffect(() => {
    function handle(e) {
      if (!btnRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function openMenu() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX });
    }
    setOpen(o => !o);
  }

  function toggleOption(opt) {
    if (opt === "All") { onChange([]); return; } // "All" clears this filter
    const next = selected.includes(opt) ? selected.filter(v => v !== opt) : [...selected, opt];
    onChange(next);
  }

  const buttonLabel = !active ? label
    : selected.length === 1 ? selected[0]
    : `${selected.length} selected`;

  return (
    <>
      <button ref={btnRef} onClick={openMenu}
        style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
          background: active ? "#1d4ed8" : "white",
          color: active ? "white" : "#374151",
          border: active ? "1px solid #1d4ed8" : "1px solid #d1d5db",
          fontWeight: active ? 600 : 400, whiteSpace: "nowrap",
        }}>
        {buttonLabel}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0 }}>
          <path d="M1 1l4 4 4-4" stroke={active ? "white" : "#6b7280"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div ref={menuRef} style={{
          position: "fixed", top: pos.top, left: pos.left, zIndex: 9999,
          background: "white", border: "1px solid #e5e7eb",
          borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
          minWidth: "180px", maxHeight: "280px", overflowY: "auto",
        }}>
          <div onClick={() => toggleOption("All")}
            style={{
              padding: "8px 14px", fontSize: "12px", cursor: "pointer",
              background: !active ? "#eff6ff" : "transparent",
              color: !active ? "#1d4ed8" : "#374151", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "8px",
              borderBottom: "1px solid #f3f4f6",
            }}>
            <span style={{ width: "14px", color: "#1d4ed8", fontWeight: 700 }}>{!active ? "✓" : ""}</span>
            All
          </div>
          {realOptions.map(opt => {
            const isSel = selected.includes(opt);
            return (
              <div key={opt} onClick={() => toggleOption(opt)}
                style={{
                  padding: "8px 14px", fontSize: "12px", cursor: "pointer",
                  background: isSel ? "#eff6ff" : "transparent",
                  color: isSel ? "#1d4ed8" : "#374151",
                  display: "flex", alignItems: "center", gap: "8px",
                  borderBottom: "1px solid #f3f4f6",
                }}>
                <span style={{
                  width: "13px", height: "13px", borderRadius: "3px", flexShrink: 0,
                  border: `1.5px solid ${isSel ? "#1d4ed8" : "#cbd5e1"}`,
                  background: isSel ? "#1d4ed8" : "white",
                  color: "white", fontSize: "10px", fontWeight: 700, lineHeight: "11px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{isSel ? "✓" : ""}</span>
                {colorMap && (
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: colorMap[opt] || "#999", flexShrink: 0, display: "inline-block" }}></span>
                )}
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// Shared filter bar used across tabs
function FilterBar({ filters, setFilters, extraFilters, setExtraFilters, uniqueNames, uniqueRoles, uniqueTechs, uniqueLocs, uniqueCities, extraOptions }) {
  const count = Object.values(filters).filter(isFilterActive).length +
                (extraFilters ? Object.values(extraFilters).filter(isFilterActive).length : 0);
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center",
      background: "#f8fafc", border: "1px solid #e2e8f0",
      borderRadius: "10px", padding: "10px 14px", marginBottom: "14px",
    }}>
      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, marginRight: "4px" }}>
        <i className="ti ti-filter" style={{ fontSize: "13px", verticalAlign: "-2px", marginRight: "4px" }} aria-hidden="true"></i>
        Filter:
      </span>
      <FilterSelect label="Resource" options={uniqueNames}  value={filters.name}     onChange={v => setFilters(f => ({...f, name: v}))} />
      <FilterSelect label="Role"     options={uniqueRoles}  value={filters.role}     onChange={v => setFilters(f => ({...f, role: v}))} />
      <FilterSelect label="Tech"     options={uniqueTechs}  value={filters.tech}     onChange={v => setFilters(f => ({...f, tech: v}))} colorMap={TECH_COLORS} />
      <FilterSelect label="Location" options={uniqueLocs}   value={filters.location} onChange={v => setFilters(f => ({...f, location: v}))} />
      {uniqueCities && <FilterSelect label="City" options={uniqueCities} value={filters.city || []} onChange={v => setFilters(f => ({...f, city: v}))} />}
      {extraOptions && extraOptions.map(([lbl, key, opts, cmap]) => (
        <FilterSelect key={key} label={lbl} options={opts} value={extraFilters[key]}
          onChange={v => setExtraFilters(f => ({...f, [key]: v}))} colorMap={cmap} />
      ))}
      {count > 0 && (
        <button onClick={() => {
          setFilters(f => Object.fromEntries(Object.keys(f).map(k => [k, []])));
          if (setExtraFilters) setExtraFilters(f => Object.fromEntries(Object.keys(f).map(k => [k, []])));
        }}
          style={{ marginLeft: "auto", fontSize: "11px", padding: "4px 12px", borderRadius: "6px", color: "#dc2626", background: "#fef2f2", border: "1px solid #fca5a5", cursor: "pointer", fontWeight: 500 }}>
          ✕ Clear {count} filter{count > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}

const TD = { borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" };
const TH_BASE = {
  background: "#f1f5f9", borderRight: "1px solid #cbd5e1", borderBottom: "2px solid #94a3b8",
  padding: "9px 10px", textAlign: "left", fontWeight: 600, fontSize: "12px",
  color: "#334155", whiteSpace: "nowrap",
};

const TYPE_META = {
  shift_change:  { icon: "ti-edit",            color: "#1d4ed8", bg: "#eff6ff", label: "Change shift",     desc: "Assign a specific shift to a resource over one or more days" },
  leave:         { icon: "ti-beach",            color: "#d97706", bg: "#fffbeb", label: "Mark leave",       desc: "Mark a resource as OFF (leave) for a date range" },
  leave_replace: { icon: "ti-arrows-exchange",  color: "#7c3aed", bg: "#f5f3ff", label: "Leave with cover", desc: "Put someone on leave and assign their shift to a replacement" },
  swap:          { icon: "ti-transfer",         color: "#0891b2", bg: "#ecfeff", label: "Swap shifts",      desc: "Swap the shifts of two resources with each other over a date range" },
  flip:          { icon: "ti-arrows-right-left",color: "#be185d", bg: "#fdf2f8", label: "Flip own shift",   desc: "Invert one resource's S1 ↔ S2 shift over a date range — no second resource needed" },
};

const SEL_STYLE = { width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "12px", background: "white", color: "#1e293b" };
const INP_STYLE = { width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "12px", boxSizing: "border-box" };
const LBL_STYLE = { fontSize: "11px", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.5px" };

function AdhocTab({ adhocForm, setAdhocForm, adhocList, setAdhocList, adhocMsg, setAdhocMsg, roster, month, year, monthName, manualOverrides, setManualOverrides, TH_BASE, TD, teamMembers }) {
  const { type, personId, date, toDate, newShift, replacerId, reason } = adhocForm;
  const meta = TYPE_META[type];
  const needsReplacer = type === "leave_replace" || type === "swap";
  const needsNewShift = type === "shift_change";
  const showDateRange = type !== ""; // every adhoc type now supports an optional date range
  const daysInMonth = new Date(year, month, 0).getDate();
  const padM = String(month).padStart(2, "0");

  function applyAdhoc() {
    if (!personId || !date) { setAdhocMsg("Please select a resource and date."); return; }
    const person = teamMembers.find(m => m.id === +personId);
    const replacer = teamMembers.find(m => m.id === +replacerId);
    const newOverrides = JSON.parse(JSON.stringify(manualOverrides));

    const dateRange = [];
    if (toDate && toDate >= date) {
      let cur = new Date(date + "T00:00:00");
      const end = new Date(toDate + "T00:00:00");
      while (cur <= end) { dateRange.push(cur.getDate()); cur.setDate(cur.getDate() + 1); }
    } else {
      dateRange.push(new Date(date + "T00:00:00").getDate());
    }

    let logEntry = { id: Date.now(), type, reason, person: person?.name, dates: dateRange, month, year };

    if (type === "shift_change") {
      dateRange.forEach(d => { newOverrides[+personId] = { ...(newOverrides[+personId] || {}), [d]: newShift }; });
      logEntry.detail = `→ ${newShift}`;
    } else if (type === "leave") {
      dateRange.forEach(d => { newOverrides[+personId] = { ...(newOverrides[+personId] || {}), [d]: "OFF" }; });
      logEntry.detail = "Marked as leave (OFF)";
    } else if (type === "leave_replace") {
      if (!replacerId) { setAdhocMsg("Please select a replacement resource."); return; }
      dateRange.forEach(d => {
        const orig = roster[+personId]?.[d] || "S1";
        newOverrides[+personId]   = { ...(newOverrides[+personId]  || {}), [d]: "OFF" };
        newOverrides[+replacerId] = { ...(newOverrides[+replacerId] || {}), [d]: orig };
      });
      logEntry.detail = `Leave covered by ${replacer?.name}`;
      logEntry.replacer = replacer?.name;
    } else if (type === "swap") {
      if (!replacerId) { setAdhocMsg("Please select the swap partner."); return; }
      dateRange.forEach(d => {
        const shiftA = roster[+personId]?.[d]  || "OFF";
        const shiftB = roster[+replacerId]?.[d] || "OFF";
        newOverrides[+personId]   = { ...(newOverrides[+personId]  || {}), [d]: shiftB };
        newOverrides[+replacerId] = { ...(newOverrides[+replacerId] || {}), [d]: shiftA };
      });
      logEntry.detail = `Swapped with ${replacer?.name}`;
      logEntry.replacer = replacer?.name;
    } else if (type === "flip") {
      const flipped = [];
      dateRange.forEach(d => {
        const current = newOverrides[+personId]?.[d] ?? roster[+personId]?.[d] ?? "OFF";
        if (current === "S1" || current === "S2") {
          const inverted = current === "S1" ? "S2" : "S1";
          newOverrides[+personId] = { ...(newOverrides[+personId] || {}), [d]: inverted };
          flipped.push(d);
        }
      });
      if (flipped.length === 0) { setAdhocMsg("No S1/S2 weekday shifts found in that range to flip."); return; }
      logEntry.dates = flipped;
      logEntry.detail = "Own shift flipped (S1 ↔ S2)";
    }

    setManualOverrides(newOverrides);
    setAdhocList(prev => [logEntry, ...prev]);
    setAdhocForm({ type, personId: "", date: "", toDate: "", newShift: "OFF", replacerId: "", reason: "" });
    setAdhocMsg("✓ Applied successfully");
    setTimeout(() => setAdhocMsg(""), 3000);
  }

  function revertAdhoc(id) {
    const entry = adhocList.find(e => e.id === id);
    if (!entry) return;
    const pid = teamMembers.find(m => m.name === entry.person)?.id;
    const rid = entry.replacer ? teamMembers.find(m => m.name === entry.replacer)?.id : null;
    setManualOverrides(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (pid) { entry.dates.forEach(d => { if (next[pid]) delete next[pid][d]; }); }
      if (rid) { entry.dates.forEach(d => { if (next[rid]) delete next[rid][d]; }); }
      return next;
    });
    setAdhocList(prev => prev.filter(e => e.id !== id));
  }

  const previewPerson = teamMembers.find(m => m.id === +personId);
  const previewReplacer = teamMembers.find(m => m.id === +replacerId);

  return (
    <div>
      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
        Create adhoc adjustments — leave, cover, swaps, or manual shift changes. All changes are tracked in the log and reflected in Calendar Roster.
      </p>

      {/* Type cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: "10px", marginBottom: "20px" }}>
        {Object.entries(TYPE_META).map(([key, m]) => (
          <div key={key} onClick={() => setAdhocForm(f => ({ ...f, type: key }))}
            style={{ padding: "12px 14px", borderRadius: "10px", cursor: "pointer", border: `2px solid ${type === key ? m.color : "#e2e8f0"}`, background: type === key ? m.bg : "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
              <i className={`ti ${m.icon}`} style={{ fontSize: "16px", color: m.color }} aria-hidden="true"></i>
              <span style={{ fontSize: "13px", fontWeight: 700, color: type === key ? m.color : "#334155" }}>{m.label}</span>
            </div>
            <p style={{ fontSize: "11px", color: "#64748b", margin: 0, lineHeight: 1.4 }}>{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={{ background: "white", border: `2px solid ${meta.color}40`, borderRadius: "12px", padding: "18px 20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className={`ti ${meta.icon}`} style={{ fontSize: "16px", color: meta.color }} aria-hidden="true"></i>
          </div>
          <span style={{ fontSize: "14px", fontWeight: 700, color: meta.color }}>{meta.label}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px,1fr))", gap: "14px" }}>
          <div>
            <label style={LBL_STYLE}>{type === "swap" ? "Resource A" : "Resource"}</label>
            <select style={SEL_STYLE} value={personId} onChange={e => setAdhocForm(f => ({ ...f, personId: e.target.value }))}>
              <option value="">— Select resource —</option>
              {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.tech})</option>)}
            </select>
          </div>

          <div>
            <label style={LBL_STYLE}>{type === "leave" || type === "leave_replace" ? "Leave from" : "From date"}</label>
            <input type="date" value={date}
              min={`${year}-${padM}-01`}
              max={`${year}-${padM}-${String(daysInMonth).padStart(2,"0")}`}
              onChange={e => setAdhocForm(f => ({ ...f, date: e.target.value }))}
              style={INP_STYLE} />
          </div>

          {showDateRange && (
            <div>
              <label style={LBL_STYLE}>{type === "leave" || type === "leave_replace" ? "Leave to (optional)" : "To date (optional)"}</label>
              <input type="date" value={toDate}
                min={date || `${year}-${padM}-01`}
                max={`${year}-${padM}-${String(daysInMonth).padStart(2,"0")}`}
                onChange={e => setAdhocForm(f => ({ ...f, toDate: e.target.value }))}
                style={INP_STYLE} />
            </div>
          )}

          {needsNewShift && (
            <div>
              <label style={LBL_STYLE}>New shift</label>
              <select style={SEL_STYLE} value={newShift} onChange={e => setAdhocForm(f => ({ ...f, newShift: e.target.value }))}>
                {[["S1","06:00–15:00 IST"],["S2","14:00–23:00 IST"],["GEN","General (offshore mgr)"],["G-PST","Onsite PST"],["WS1","Weekend Shift 1"],["WS2","Weekend Shift 2"],["OFF","Day off"]].map(([s, desc]) => (
                  <option key={s} value={s}>{s} — {desc}</option>
                ))}
              </select>
            </div>
          )}

          {needsReplacer && (
            <div>
              <label style={LBL_STYLE}>{type === "swap" ? "Resource B (swap with)" : "Replacement resource"}</label>
              <select style={SEL_STYLE} value={replacerId} onChange={e => setAdhocForm(f => ({ ...f, replacerId: e.target.value }))}>
                <option value="">— Select resource —</option>
                {teamMembers.filter(m => m.id !== +personId).map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.tech})</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={LBL_STYLE}>Reason / notes (optional)</label>
            <input type="text" value={reason} placeholder="e.g. Personal emergency, medical leave, client request…"
              onChange={e => setAdhocForm(f => ({ ...f, reason: e.target.value }))}
              style={INP_STYLE} />
          </div>
        </div>

        {personId && date && (
          <div style={{ marginTop: "14px", padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", color: "#475569" }}>
            <strong style={{ color: "#0f172a" }}>Preview: </strong>
            {previewPerson?.name}
            {type === "shift_change" && ` → shift changed to ${newShift}`}
            {type === "leave" && ` → marked OFF (leave)`}
            {type === "leave_replace" && previewReplacer && ` → ON LEAVE, covered by ${previewReplacer.name}`}
            {type === "swap" && previewReplacer && ` ↔ swap shifts with ${previewReplacer.name}`}
            {type === "flip" && ` → own shift flipped (S1 ↔ S2)`}
            {date && ` on ${new Date(date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
            {toDate && toDate > date && ` – ${new Date(toDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
            {reason && ` · "${reason}"`}
          </div>
        )}

        <div style={{ marginTop: "14px", display: "flex", gap: "10px", alignItems: "center" }}>
          <button onClick={applyAdhoc}
            style={{ background: meta.color, color: "white", border: "none", padding: "9px 22px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <i className="ti ti-check" style={{ fontSize: "14px" }} aria-hidden="true"></i>Apply
          </button>
          <button onClick={() => setAdhocForm({ type, personId: "", date: "", toDate: "", newShift: "OFF", replacerId: "", reason: "" })}
            style={{ padding: "9px 16px", fontSize: "13px", borderRadius: "8px", background: "white", border: "1px solid #e2e8f0", color: "#64748b", cursor: "pointer" }}>
            Clear
          </button>
          {adhocMsg && (
            <span style={{ fontSize: "12px", fontWeight: 600, color: adhocMsg.startsWith("✓") ? "#16a34a" : "#dc2626" }}>{adhocMsg}</span>
          )}
        </div>
      </div>

      {/* Log */}
      <div style={{ background: "white", border: "2px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
            <i className="ti ti-list-check" style={{ fontSize: "14px", marginRight: "6px", verticalAlign: "-2px" }} aria-hidden="true"></i>
            Override log ({adhocList.length})
          </span>
          {adhocList.length > 0 && (
            <button onClick={() => { setAdhocList([]); setManualOverrides({}); }}
              style={{ fontSize: "11px", padding: "4px 12px", borderRadius: "6px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", cursor: "pointer", fontWeight: 600 }}>
              ✕ Clear all
            </button>
          )}
        </div>
        {adhocList.length === 0 ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
            <i className="ti ti-inbox" style={{ fontSize: "28px", display: "block", marginBottom: "8px" }} aria-hidden="true"></i>
            No adhoc changes yet. Use the form above to apply overrides.
          </div>
        ) : (
          <table style={{ borderCollapse: "collapse", fontSize: "12px", width: "100%" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                {["Type", "Resource", "Date(s)", "Detail", "Reason", "Action"].map(h => (
                  <th key={h} style={{ ...TH_BASE, fontSize: "11px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adhocList.map((entry, i) => {
                const m = TYPE_META[entry.type];
                const dateLabel = entry.dates.length === 1
                  ? `${monthName.slice(0, 3)} ${entry.dates[0]}`
                  : `${monthName.slice(0, 3)} ${entry.dates[0]}–${entry.dates[entry.dates.length - 1]} (${entry.dates.length}d)`;
                return (
                  <tr key={entry.id} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                    <td style={{ ...TD, padding: "9px 12px" }}>
                      <span style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "5px", background: m.bg, color: m.color, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <i className={`ti ${m.icon}`} style={{ fontSize: "12px" }} aria-hidden="true"></i>{m.label}
                      </span>
                    </td>
                    <td style={{ ...TD, padding: "9px 12px", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap" }}>
                      {entry.person}
                      {entry.replacer && <span style={{ color: "#64748b", fontWeight: 400 }}> ↔ {entry.replacer}</span>}
                    </td>
                    <td style={{ ...TD, padding: "9px 12px", color: "#475569", whiteSpace: "nowrap" }}>{dateLabel}</td>
                    <td style={{ ...TD, padding: "9px 12px", color: "#0f172a" }}>{entry.detail}</td>
                    <td style={{ ...TD, padding: "9px 12px", color: "#64748b", fontStyle: entry.reason ? "normal" : "italic" }}>{entry.reason || "—"}</td>
                    <td style={{ ...TD, padding: "9px 12px" }}>
                      <button onClick={() => revertAdhoc(entry.id)}
                        style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "5px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", cursor: "pointer", fontWeight: 600 }}>
                        Revert
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ChangePinModal({ user, onSave, onClose }) {
  const [currentPin,  setCurrentPin]  = useState("");
  const [newPin,      setNewPin]      = useState("");
  const [confirmPin,  setConfirmPin]  = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState(false);

  function handleSave() {
    if (currentPin !== user.pin)       { setError("Current PIN is incorrect."); return; }
    if (newPin.length < 4)             { setError("New PIN must be at least 4 digits."); return; }
    if (!/^\d+$/.test(newPin))         { setError("PIN must contain digits only."); return; }
    if (newPin === currentPin)         { setError("New PIN must be different from current PIN."); return; }
    if (newPin !== confirmPin)         { setError("New PINs do not match."); return; }
    onSave(newPin);
    setSuccess(true);
    setTimeout(onClose, 1500);
  }

  const overlay = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" };
  const box     = { background: "white", borderRadius: "14px", padding: "28px 30px", width: "380px", maxWidth: "94vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", border: "1px solid #e2e8f0" };

  const pinField = (label, val, setVal, show, setShow, placeholder) => (
    <div style={{ marginBottom: "14px" }}>
      <label style={LBL_STYLE}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type={show ? "text" : "password"} value={val}
          onChange={e => { setVal(e.target.value.replace(/\D/g,"").slice(0,8)); setError(""); }}
          placeholder={placeholder} maxLength={8}
          style={{ ...INP_STYLE, paddingRight: "38px", letterSpacing: "6px", fontSize: "18px", fontWeight: 600, textAlign: "center" }} />
        <button onClick={() => setShow(s => !s)} tabIndex={-1}
          style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
          <i className={`ti ${show ? "ti-eye-off" : "ti-eye"}`} style={{ fontSize: "15px" }} aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={box}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #fde68a" }}>
              <i className="ti ti-key" style={{ fontSize: "18px", color: "#d97706" }} aria-hidden="true"></i>
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Change PIN</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>{user.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#94a3b8" }}>✕</button>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>✓</div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#166534" }}>PIN updated successfully!</p>
          </div>
        ) : (
          <>
            {pinField("Current PIN", currentPin, setCurrentPin, showCurrent, setShowCurrent, "Enter current PIN")}
            {pinField("New PIN", newPin, setNewPin, showNew, setShowNew, "Enter new PIN")}
            {pinField("Confirm New PIN", confirmPin, setConfirmPin, showConfirm, setShowConfirm, "Confirm new PIN")}

            {newPin && confirmPin && newPin !== confirmPin && (
              <p style={{ fontSize: "11px", color: "#dc2626", marginBottom: "8px", marginTop: "-8px" }}>PINs do not match</p>
            )}

            {error && (
              <div style={{ marginBottom: "14px", padding: "8px 12px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "7px", display: "flex", gap: "7px", alignItems: "center" }}>
                <i className="ti ti-alert-circle" style={{ fontSize: "14px", color: "#dc2626" }} aria-hidden="true"></i>
                <span style={{ fontSize: "12px", color: "#991b1b" }}>{error}</span>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSave}
                disabled={!currentPin || !newPin || !confirmPin}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: (!currentPin || !newPin || !confirmPin) ? "#93c5fd" : "#1d4ed8", color: "white", fontSize: "13px", fontWeight: 700, cursor: (!currentPin || !newPin || !confirmPin) ? "default" : "pointer" }}>
                Update PIN
              </button>
              <button onClick={onClose}
                style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white", color: "#374151", fontSize: "13px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PinManager({ teamMembers, setTeamMembers }) {
  const [editingId, setEditingId]   = useState(null);
  const [newPin, setNewPin]         = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [msg, setMsg]               = useState("");
  const [showNew, setShowNew]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function savePin() {
    if (newPin.length < 4)          { setMsg("❌ PIN must be at least 4 digits."); return; }
    if (!/^\d+$/.test(newPin))      { setMsg("❌ PIN must contain digits only."); return; }
    if (newPin !== confirmPin)       { setMsg("❌ PINs do not match."); return; }
    setTeamMembers(prev => prev.map(m => m.id === editingId ? { ...m, pin: newPin } : m));
    setMsg("✓ PIN updated successfully");
    setEditingId(null); setNewPin(""); setConfirmPin("");
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div style={{ marginTop: "24px", background: "white", border: "2px solid #fde68a", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ padding: "12px 18px", background: "#fffbeb", borderBottom: "1px solid #fde68a", display: "flex", alignItems: "center", gap: "8px" }}>
        <i className="ti ti-key" style={{ fontSize: "16px", color: "#d97706" }} aria-hidden="true"></i>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#92400e" }}>PIN Management</span>
        <span style={{ fontSize: "11px", color: "#b45309", marginLeft: "4px" }}>— Managers only</span>
        {msg && <span style={{ marginLeft: "auto", fontSize: "12px", color: msg.startsWith("✓") ? "#166534" : "#dc2626", fontWeight: 600 }}>{msg}</span>}
      </div>
      <div style={{ padding: "14px 18px" }}>
        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px" }}>
          Set or reset the 4-digit PIN for any team member. Share PINs securely (in person or via private message).
        </p>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "12px" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["#","Name","Role","Current PIN","Action"].map(h => (
                <th key={h} style={{ ...TH_BASE, fontSize: "11px", padding: "7px 10px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((m, i) => (
              <tr key={m.id} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                <td style={{ ...TD, padding: "7px 10px", color: "#94a3b8", textAlign: "center" }}>{i+1}</td>
                <td style={{ ...TD, padding: "7px 10px", fontWeight: m.isLead || m.isManager ? 600 : 400 }}>{m.name}</td>
                <td style={{ ...TD, padding: "7px 10px", color: "#64748b" }}>{m.role}</td>
                <td style={{ ...TD, padding: "7px 10px" }}>
                  {editingId === m.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "220px" }}>
                      <div style={{ position: "relative" }}>
                        <input type={showNew ? "text" : "password"} value={newPin}
                          onChange={e => setNewPin(e.target.value.replace(/\D/g,"").slice(0,8))}
                          placeholder="New PIN" maxLength={8}
                          style={{ ...INP_STYLE, paddingRight: "34px", letterSpacing: "4px", textAlign: "center", fontSize: "14px" }} />
                        <button onClick={() => setShowNew(s=>!s)} tabIndex={-1}
                          style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                          <i className={`ti ${showNew ? "ti-eye-off" : "ti-eye"}`} style={{ fontSize: "13px" }} aria-hidden="true"></i>
                        </button>
                      </div>
                      <div style={{ position: "relative" }}>
                        <input type={showConfirm ? "text" : "password"} value={confirmPin}
                          onChange={e => setConfirmPin(e.target.value.replace(/\D/g,"").slice(0,8))}
                          placeholder="Confirm PIN" maxLength={8}
                          style={{ ...INP_STYLE, paddingRight: "34px", letterSpacing: "4px", textAlign: "center", fontSize: "14px", borderColor: confirmPin && newPin !== confirmPin ? "#fca5a5" : "#e2e8f0" }} />
                        <button onClick={() => setShowConfirm(s=>!s)} tabIndex={-1}
                          style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                          <i className={`ti ${showConfirm ? "ti-eye-off" : "ti-eye"}`} style={{ fontSize: "13px" }} aria-hidden="true"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span style={{ letterSpacing: "4px", fontSize: "14px", color: "#94a3b8" }}>{"•".repeat(m.pin?.length || 4)}</span>
                  )}
                </td>
                <td style={{ ...TD, padding: "7px 10px" }}>
                  {editingId === m.id ? (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={savePin}
                        style={{ fontSize: "11px", padding: "4px 12px", borderRadius: "6px", background: "#1d4ed8", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>Save</button>
                      <button onClick={() => { setEditingId(null); setNewPin(""); setConfirmPin(""); setMsg(""); }}
                        style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", background: "white", border: "1px solid #e2e8f0", cursor: "pointer" }}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingId(m.id); setNewPin(""); setConfirmPin(""); setMsg(""); }}
                      style={{ fontSize: "11px", padding: "4px 12px", borderRadius: "6px", background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                      <i className="ti ti-key" style={{ fontSize: "12px" }} aria-hidden="true"></i>Reset PIN
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoginScreen({ teamMembers, onLogin }) {
  const [selectedId, setSelectedId] = useState("");
  const [pin, setPin]               = useState("");
  const [showPin, setShowPin]       = useState(false);
  const [error, setError]           = useState("");
  const [attempts, setAttempts]     = useState({}); // { memberId: count }
  const [lockedUntil, setLockedUntil] = useState({}); // { memberId: timestamp }

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_MS   = 5 * 60 * 1000; // 5 minutes

  const managers = teamMembers.filter(m => m.isManager);
  const leads    = teamMembers.filter(m => m.isLead && !m.isManager);
  const others   = teamMembers.filter(m => !m.isLead && !m.isManager);

  const selectedMember = teamMembers.find(m => m.id === +selectedId);
  const willEdit = selectedMember && (selectedMember.isLead || selectedMember.isManager);
  const isLocked = selectedMember && lockedUntil[selectedMember.id] && Date.now() < lockedUntil[selectedMember.id];
  const lockRemaining = isLocked ? Math.ceil((lockedUntil[selectedMember?.id] - Date.now()) / 60000) : 0;
  const triesLeft = selectedMember ? MAX_ATTEMPTS - (attempts[selectedMember.id] || 0) : MAX_ATTEMPTS;

  function handleLogin() {
    if (!selectedId) { setError("Please select your name."); return; }
    if (!pin)        { setError("Please enter your PIN."); return; }
    if (isLocked)    { setError(`Account locked. Try again in ${lockRemaining} min.`); return; }

    if (pin === selectedMember.pin) {
      // Success — reset attempts
      setAttempts(a => ({ ...a, [selectedMember.id]: 0 }));
      onLogin(selectedMember);
    } else {
      const newCount = (attempts[selectedMember.id] || 0) + 1;
      setAttempts(a => ({ ...a, [selectedMember.id]: newCount }));
      if (newCount >= MAX_ATTEMPTS) {
        setLockedUntil(l => ({ ...l, [selectedMember.id]: Date.now() + LOCKOUT_MS }));
        setError(`Too many incorrect attempts. Account locked for 5 minutes.`);
      } else {
        setError(`Incorrect PIN. ${MAX_ATTEMPTS - newCount} attempt${MAX_ATTEMPTS - newCount !== 1 ? "s" : ""} remaining.`);
      }
      setPin("");
    }
  }

  function handleKeyDown(e) { if (e.key === "Enter") handleLogin(); }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif", padding: "20px", colorScheme: "light" }}>
      <LightThemeGuard />
      <div style={{ background: "white", borderRadius: "16px", padding: "36px 40px", width: "420px", maxWidth: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", border: "1px solid #e2e8f0" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <i className="ti ti-calendar-stats" style={{ fontSize: "26px", color: "white" }} aria-hidden="true"></i>
          </div>
          <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>Alaska Support Roster</h1>
          <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Alaska Data Services Prod Support</p>
        </div>

        {/* Access level info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "22px" }}>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "9px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
              <i className="ti ti-pencil" style={{ fontSize: "12px", color: "#1d4ed8" }} aria-hidden="true"></i>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#1d4ed8" }}>Edit Access</span>
            </div>
            <p style={{ fontSize: "11px", color: "#374151", margin: 0, lineHeight: 1.4 }}>Managers & Leads</p>
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "9px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}>
              <i className="ti ti-eye" style={{ fontSize: "12px", color: "#15803d" }} aria-hidden="true"></i>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803d" }}>View Only</span>
            </div>
            <p style={{ fontSize: "11px", color: "#374151", margin: 0, lineHeight: 1.4 }}>All other members</p>
          </div>
        </div>

        {/* Step 1 — Name */}
        <div style={{ marginBottom: "14px" }}>
          <label style={LBL_STYLE}>Step 1 — Select your name</label>
          <select value={selectedId} onChange={e => { setSelectedId(e.target.value); setPin(""); setError(""); }}
            style={{ ...SEL_STYLE, padding: "10px 12px", fontSize: "13px", borderRadius: "8px", border: `1.5px solid ${selectedId ? "#1d4ed8" : "#e2e8f0"}` }}>
            <option value="">— Choose your name —</option>
            {managers.length > 0 && <optgroup label="── Managers">
              {managers.map(m => <option key={m.id} value={m.id}>{m.name} · {m.role}</option>)}
            </optgroup>}
            {leads.length > 0 && <optgroup label="── Leads">
              {leads.map(m => <option key={m.id} value={m.id}>{m.name} · {m.role}</option>)}
            </optgroup>}
            {others.length > 0 && <optgroup label="── Team Members">
              {others.map(m => <option key={m.id} value={m.id}>{m.name} · {m.role}</option>)}
            </optgroup>}
          </select>
        </div>

        {/* Step 2 — PIN (only shown after name selected) */}
        {selectedMember && (
          <div style={{ marginBottom: "14px" }}>
            <label style={LBL_STYLE}>Step 2 — Enter your PIN</label>

            {/* Access preview */}
            <div style={{ marginBottom: "10px", padding: "7px 12px", borderRadius: "7px", border: `1px solid ${willEdit ? "#bfdbfe" : "#bbf7d0"}`, background: willEdit ? "#eff6ff" : "#f0fdf4", display: "flex", alignItems: "center", gap: "7px" }}>
              <i className={`ti ${willEdit ? "ti-pencil" : "ti-eye"}`} style={{ fontSize: "13px", color: willEdit ? "#1d4ed8" : "#15803d" }} aria-hidden="true"></i>
              <span style={{ fontSize: "12px", color: willEdit ? "#1e40af" : "#166534" }}>
                <strong>{selectedMember.name}</strong> · <strong>{willEdit ? "Edit" : "View Only"}</strong> access
              </span>
            </div>

            {isLocked ? (
              <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="ti ti-lock" style={{ fontSize: "16px", color: "#dc2626" }} aria-hidden="true"></i>
                <span style={{ fontSize: "12px", color: "#991b1b", fontWeight: 500 }}>Account locked for {lockRemaining} more minute{lockRemaining !== 1 ? "s" : ""}. Too many incorrect attempts.</span>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={e => { setPin(e.target.value.replace(/\D/g, "").slice(0, 8)); setError(""); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter PIN"
                  maxLength={8}
                  autoFocus
                  style={{ ...INP_STYLE, paddingRight: "40px", letterSpacing: "6px", fontSize: "18px", fontWeight: 600, textAlign: "center", borderColor: error ? "#fca5a5" : "#e2e8f0", background: error ? "#fef2f2" : "white" }}
                />
                <button onClick={() => setShowPin(s => !s)} tabIndex={-1}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}>
                  <i className={`ti ${showPin ? "ti-eye-off" : "ti-eye"}`} style={{ fontSize: "16px" }} aria-hidden="true"></i>
                </button>
              </div>
            )}

            {/* Attempt indicator dots */}
            {!isLocked && (
              <div style={{ display: "flex", gap: "6px", marginTop: "8px", alignItems: "center" }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: i <= (attempts[selectedMember.id] || 0) ? "#dc2626" : "#e2e8f0" }}></div>
                ))}
                {(attempts[selectedMember.id] || 0) > 0 && (
                  <span style={{ fontSize: "11px", color: "#dc2626", marginLeft: "4px" }}>{triesLeft} attempt{triesLeft !== 1 ? "s" : ""} left</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{ marginBottom: "12px", padding: "8px 12px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "7px", display: "flex", alignItems: "center", gap: "7px" }}>
            <i className="ti ti-alert-circle" style={{ fontSize: "14px", color: "#dc2626", flexShrink: 0 }} aria-hidden="true"></i>
            <span style={{ fontSize: "12px", color: "#991b1b" }}>{error}</span>
          </div>
        )}

        <button onClick={handleLogin} disabled={!selectedId || !pin || isLocked}
          style={{ width: "100%", padding: "11px", borderRadius: "8px", border: "none", background: (!selectedId || !pin || isLocked) ? "#93c5fd" : "#1d4ed8", color: "white", fontSize: "14px", fontWeight: 700, cursor: (!selectedId || !pin || isLocked) ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <i className="ti ti-login" style={{ fontSize: "16px" }} aria-hidden="true"></i>
          Sign in
        </button>

        <p style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", marginTop: "14px", marginBottom: 0 }}>
          Forgot your PIN? Contact your manager to reset it.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("roster");
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS);
  const [manualOverrides, setManualOverrides] = useState({});
  const [savedRosterMonth, setSavedRosterMonth] = useState(null);
  const [rosterSaveMsg, setRosterSaveMsg] = useState("");
  const [selectedCell, setSelectedCell] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showExportMsg, setShowExportMsg] = useState(false);
  const [teamMembers, setTeamMembers] = useState(applyPromptMemberClassification(INITIAL_TEAM));
  const [memberModal, setMemberModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // null = not logged in
  const canEdit = !!(currentUser?.isLead || currentUser?.isManager);
  const [changePinOpen, setChangePinOpen] = useState(false);

  // Adhoc & override log
  const [adhocList, setAdhocList] = useState([]);
  const [adhocForm, setAdhocForm] = useState({
    type: "shift_change", personId: "", date: "", toDate: "",
    newShift: "OFF", replacerId: "", reason: "",
  });
  const [adhocMsg, setAdhocMsg] = useState("");

  // ---- Backend sync (Supabase) ----
  // hydrated: have we finished the initial load from the backend yet?
  // Saving is skipped until hydration completes so we never overwrite
  // remote data with the local placeholder defaults above.
  const [hydrated, setHydrated] = useState(!isBackendConfigured());
  const [syncStatus, setSyncStatus] = useState(isBackendConfigured() ? "syncing" : "offline"); // syncing | synced | offline | error
  const monthLoadedRef = useRef(null); // tracks which "year-month" key's overrides/adhoc are currently loaded

  // Initial load: team members + conditions (these are global, not per-month)
  useEffect(() => {
    if (!isBackendConfigured()) return;
    let cancelled = false;
    (async () => {
      try {
        const [members, savedConditions] = await Promise.all([loadTeamMembers(), loadConditions()]);
        if (cancelled) return;
        if (members && members.length) setTeamMembers(applyPromptMemberClassification(members));
        else {
			console.warn("[backend] No team members found in Supabase. Skipping INITIAL_TEAM auto-seed to avoid PIN reset.");
		}; 
        if (savedConditions) setConditions(savedConditions);
        else {
          console.warn("[backend] No conditions found. Using local DEFAULT_CONDITIONS without saving automatically.");
        }; // first run: seed the backend
        setSyncStatus("synced");
      } catch (e) {
        console.error("[backend] initial load failed", e);
        setSyncStatus("error");
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load per-month overrides + adhoc log + saved finalized roster whenever the selected month changes
  useEffect(() => {
    if (!isBackendConfigured() || !hydrated) return;
    const key = `${year}-${month}`;
    let cancelled = false;
    (async () => {
      try {
        const [{ overrides, adhocList: list }, storedRoster] = await Promise.all([
          loadMonthData(year, month),
          loadRosterMonth(year, month),
        ]);
        if (cancelled) return;
        monthLoadedRef.current = key; // mark before setState so save-effects below don't fire on stale data
        setManualOverrides(overrides || {});
        setAdhocList(list || []);
        setSavedRosterMonth(storedRoster || null);
      } catch (e) {
        console.error("[backend] month load failed", e);
        if (!cancelled) setSavedRosterMonth(null);
      }
    })();
    return () => { cancelled = true; };
  }, [year, month, hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save team members whenever they change (after initial hydration)
  useEffect(() => {
    if (!isBackendConfigured() || !hydrated) return;
    saveTeamMembers(teamMembers).catch(e => console.error("[backend] save team_members failed", e));
  }, [teamMembers, hydrated]);

  // Save conditions whenever they change (after initial hydration)
  useEffect(() => {
    if (!isBackendConfigured() || !hydrated) return;
    saveConditions(conditions).catch(e => console.error("[backend] save conditions failed", e));
  }, [conditions, hydrated]);

  // Save manual overrides for the currently-selected month
  useEffect(() => {
    if (!isBackendConfigured() || !hydrated) return;
    if (monthLoadedRef.current !== `${year}-${month}`) return; // don't save until this month's data has loaded
    saveMonthOverrides(year, month, manualOverrides).catch(e => console.error("[backend] save overrides failed", e));
  }, [manualOverrides, year, month, hydrated]);

  // Save adhoc log for the currently-selected month
  useEffect(() => {
    if (!isBackendConfigured() || !hydrated) return;
    if (monthLoadedRef.current !== `${year}-${month}`) return;
    saveMonthAdhocList(year, month, adhocList).catch(e => console.error("[backend] save adhoc list failed", e));
  }, [adhocList, year, month, hydrated]);
  // ---- end backend sync ----


  const [rosterFilters, setRosterFilters] = useState({ name: [], tech: [], role: [], location: [], city: [] });
  const [rosterExtra,   setRosterExtra]   = useState({ shift: [] });
  const [teamFilters,   setTeamFilters]   = useState({ name: [], tech: [], role: [], location: [] });
  const [auditFilters,  setAuditFilters]  = useState({ name: [], tech: [], role: [], location: [] });
  const [auditExtra,    setAuditExtra]    = useState({ status: [] });
  const [singleDate,    setSingleDate]    = useState(""); // "YYYY-MM-DD" — when set, Calendar Roster shows only this one date's column

  const monthName = new Date(year, month - 1, 1).toLocaleString("default", { month: "long" });
  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const SHIFTS_LIST = ["S1","S2","GEN","G-PST","WS1","WS2","OFF"];

  const generatedResult = useMemo(
    () => generateRoster(year, month, conditions, teamMembers),
    [year, month, conditions, teamMembers]
  );
  const days = generatedResult.days;
  const baseRoster = useMemo(() => {
    return savedRosterMonth || generatedResult.roster;
  }, [savedRosterMonth, generatedResult]);

  const roster = useMemo(() => {
    const r = {};
    teamMembers.forEach(m => { r[m.id] = { ...(baseRoster[m.id] || {}), ...(manualOverrides[m.id] || {}) }; });
    return r;
  }, [baseRoster, manualOverrides, teamMembers]);
  // When a month has been explicitly saved, keep the final visible roster in roster_months
  // in sync with any manual override changes.
  useEffect(() => {
    if (!isBackendConfigured() || !hydrated) return;
    if (monthLoadedRef.current !== `${year}-${month}`) return;
    if (!savedRosterMonth) return;

    const timer = setTimeout(() => {
      saveRosterMonth(
        year,
        month,
        roster,
        "override-applied",
        currentUser?.name || "system"
      ).catch(e => console.error("[backend] autosave roster_months failed", e));
    }, 800);

    return () => clearTimeout(timer);
  }, [manualOverrides, roster, year, month, hydrated, savedRosterMonth, currentUser]);

  const stats = useMemo(() => calcStats(roster, days, teamMembers), [roster, days, teamMembers]);
  const targetWorkDays = days.length - days.filter(d => d.isWeekend).length;

  const padM = String(month).padStart(2, "0");
  const daysInMonthCount = new Date(year, month, 0).getDate();
  // If singleDate falls within the currently selected month/year, show only that
  // one date's column in Calendar Roster. Otherwise (e.g. stale selection after
  // switching month) fall back to showing the whole month.
  const singleDateDay = singleDate && singleDate.startsWith(`${year}-${padM}-`) ? +singleDate.slice(-2) : null;
  const visibleDays = singleDateDay ? days.filter(d => d.date === singleDateDay) : days;

  const uniqueNames  = ["All", ...teamMembers.map(m => m.name)];
  const uniqueTechs  = ["All", ...Array.from(new Set(teamMembers.map(m => m.tech)))];
  const uniqueRoles  = ["All", ...Array.from(new Set(teamMembers.map(m => m.role)))];
  const uniqueLocs   = ["All", "Onsite", "Offshore"];
  const uniqueCities = ["All", ...Array.from(new Set(teamMembers.map(m => m.city).filter(Boolean))).sort()];
  const uniqueShifts = ["All", ...SHIFTS_LIST];
  const uniqueStatus = ["All", "OK", "Review"];
  const shiftColorMap = Object.fromEntries(SHIFTS_LIST.map(s => [s, SHIFT_COLORS[s].border]));

  function matchesFilter(sel, val) {
    // No selection (or legacy "All") = filter inactive = everything matches.
    // Otherwise match if val is one of the selected options (OR logic).
    if (!sel || sel === "All") return true;
    if (Array.isArray(sel)) return sel.length === 0 || sel.includes(val);
    return sel === val;
  }

  function applyBase(filters, members) {
    return members.filter(m => {
      if (!matchesFilter(filters.name, m.name)) return false;
      if (!matchesFilter(filters.tech, m.tech)) return false;
      if (!matchesFilter(filters.role, m.role)) return false;
      if (!matchesFilter(filters.location, m.location)) return false;
      if (!matchesFilter(filters.city, m.city)) return false;
      return true;
    });
  }

  const filteredRoster = useMemo(() => {
  let members = applyBase(rosterFilters, teamMembers);

  if (rosterExtra.shift && rosterExtra.shift.length > 0) {

    members = members.filter(member => {

      // If a specific date is selected, filter using that day's shift only
      if (singleDateDay) {
        const shiftForSelectedDay =
          roster[member.id]?.[singleDateDay] || "OFF";

        return rosterExtra.shift.includes(shiftForSelectedDay);
      }

      // Otherwise retain existing behaviour (match anywhere in month)
      return Object.values(roster[member.id] || {}).some(shift =>
        rosterExtra.shift.includes(shift)
      );
    });
  }

  return members;
}, [rosterFilters,rosterExtra,roster,teamMembers,singleDateDay]);

  const filteredTeam  = useMemo(() => applyBase(teamFilters, teamMembers), [teamFilters, teamMembers]);
  const filteredAudit = useMemo(() => {
    let members = applyBase(auditFilters, teamMembers);
    if (auditExtra.status && auditExtra.status.length > 0) {
      members = members.filter(m => {
        const ok = stats[m.id].workDays === targetWorkDays;
        return auditExtra.status.includes(ok ? "OK" : "Review");
      });
    }
    return members;
  }, [auditFilters, auditExtra, stats, conditions.minDaysPerMonth]);

  const avgWorkDays = (Object.values(stats).reduce((a, b) => a + b.workDays, 0) / teamMembers.length).toFixed(1);
  const minDays  = Math.min(...Object.values(stats).map(s => s.workDays));
  const maxDays  = Math.max(...Object.values(stats).map(s => s.workDays));
  const fairness = Math.max(0, 100 - (maxDays - minDays) * 5).toFixed(1);

  function handleAddMember(form) {
    const newId = Math.max(...teamMembers.map(m => m.id)) + 1;
    const flags = deriveFlags(form.role);
    setTeamMembers(prev => [...prev, { id: newId, ...form, designation: form.designation || "A", ...flags }]);
    setMemberModal(null);
  }

  function handleEditMember(form) {
    const flags = deriveFlags(form.role);
    setTeamMembers(prev => prev.map(m => m.id === memberModal.member.id ? { ...m, ...form, designation: form.designation || m.designation || "A", ...flags } : m));
    setMemberModal(null);
  }

  function handleDeleteMember() {
    setTeamMembers(prev => prev.filter(m => m.id !== deleteTarget.id));
    setManualOverrides(prev => { const n = { ...prev }; delete n[deleteTarget.id]; return n; });
    setDeleteTarget(null);
  }

  function handleShiftChange(shift) {
    if (!selectedCell) return;
    setManualOverrides(prev => ({ ...prev, [selectedCell.memberId]: { ...(prev[selectedCell.memberId] || {}), [selectedCell.date]: shift } }));
    setSelectedCell(null);
  }

  async function handleSaveRosterSchedule(source = "generated") {
    try {
      if (!isBackendConfigured()) {
        setRosterSaveMsg("Supabase is not configured.");
        return;
      }
      await saveRosterMonth(year, month, roster, source, currentUser?.name || "system");
      setSavedRosterMonth(roster);
      setRosterSaveMsg(`✓ Saved ${monthName} ${year} roster schedule`);
      setTimeout(() => setRosterSaveMsg(""), 3000);
    } catch (e) {
      console.error("[backend] save roster schedule failed", e);
      setRosterSaveMsg("Failed to save roster schedule. Check roster_months table/policies.");
    }
  }

  async function handleRegenerateAndReplaceSavedRoster() {
    try {
      if (!isBackendConfigured()) {
        setRosterSaveMsg("Supabase is not configured.");
        return;
      }
      setGenerating(true);
      await deleteRosterMonth(year, month);
      const fresh = generateRoster(year, month, conditions, teamMembers);
      await saveRosterMonth(year, month, fresh.roster, "regenerated", currentUser?.name || "system");
      setSavedRosterMonth(fresh.roster);
      setManualOverrides({});
      setRosterSaveMsg(`✓ Regenerated and saved ${monthName} ${year}`);
      setTimeout(() => setRosterSaveMsg(""), 3000);
    } catch (e) {
      console.error("[backend] regenerate roster schedule failed", e);
      setRosterSaveMsg("Failed to regenerate roster schedule. Check roster_months table/policies.");
    } finally {
      setGenerating(false);
    }
  }

  function handleExport() {
  const data = [];

  data.push([
    "Name",
    "Tech",
    "Role",
    ...days.map(d => `${month}/${d.date}`)
  ]);

  filteredRoster.forEach(member => {
    data.push([
      member.name,
      member.tech,
      member.role,
      ...days.map(d => roster[member.id]?.[d.date] || "OFF")
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  
  const EXCEL_SHIFT_COLORS = {
  S1:  "DBEAFE",
  S2:  "DCFCE7",
  GEN: "EDE9FE",
  "G-PST": "EDE9FE",
  WS1: "FEF3C7",
  WS2: "FEE2E2",
  OFF: "F3F4F6"};
  
  for (let r = 1; r < data.length; r++) {

    for (let c = 3; c < data[r].length; c++) {
  
      const cellRef =
        XLSX.utils.encode_cell({ r, c });
  
      const shift = data[r][c];
  
      if (ws[cellRef] && EXCEL_SHIFT_COLORS[shift]) {
  
        ws[cellRef].s = {
          fill: {
            fgColor: {
              rgb: EXCEL_SHIFT_COLORS[shift]
            }
          }
        };
      }
    }
  };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Roster");

  const excelBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array"
  });

  const file = new Blob(
    [excelBuffer],
    {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  );

  saveAs(file,`Alaska_Roster_${monthName}_${year}.xlsx`);}




  const activeTabFilterCount = () => {
    if (tab === "roster") return Object.values(rosterFilters).filter(isFilterActive).length + Object.values(rosterExtra).filter(isFilterActive).length;
    if (tab === "team")   return Object.values(teamFilters).filter(isFilterActive).length;
    if (tab === "audit")  return Object.values(auditFilters).filter(isFilterActive).length + Object.values(auditExtra).filter(isFilterActive).length;
    return 0;
  };

  if (!hydrated) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "10px", fontFamily: "'Inter', system-ui, sans-serif", color: "#64748b" }}>
        <i className="ti ti-loader-2" style={{ fontSize: "26px" }} aria-hidden="true"></i>
        <span style={{ fontSize: "13px" }}>Loading roster data…</span>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen teamMembers={teamMembers} onLogin={(member) => {
      setCurrentUser(member);
      logAuditEvent({ type: "login", memberName: member?.name, detail: "Logged in" });
    }} />;
  }

  function handleChangePin(newPin) {
    setTeamMembers(prev => prev.map(m => m.id === currentUser.id ? { ...m, pin: newPin } : m));
    setCurrentUser(prev => ({ ...prev, pin: newPin }));
    logAuditEvent({ type: "pin_change", memberName: currentUser.name, detail: "PIN updated" });
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#1e293b", padding: "0 0 2rem", background: "#ffffff", colorScheme: "light" }}>
      <LightThemeGuard />
      <h2 style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}>Alaska Support Roster</h2>
      {changePinOpen && <ChangePinModal user={currentUser} onSave={handleChangePin} onClose={() => setChangePinOpen(false)} />}

      {/* ── Header ── */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="ti ti-calendar-stats" style={{ fontSize: "18px", color: "white" }} aria-hidden="true"></i>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Alaska Support Roster</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Alaska Data Services Prod Support · Service Delivery</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Logged-in user badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f1f5f9", borderRadius: "8px", padding: "5px 10px 5px 8px", border: "1px solid #e2e8f0" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: TECH_COLORS[currentUser.tech] || "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "10px", fontWeight: 700, flexShrink: 0 }}>
              {currentUser.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>{currentUser.name}</div>
              <div style={{ fontSize: "10px", color: "#64748b", lineHeight: 1.2 }}>{currentUser.role}</div>
            </div>
            <div style={{ display: "flex", gap: "4px", marginLeft: "4px" }}>
              <button onClick={() => setChangePinOpen(true)} title="Change my PIN"
                style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer", color: "#64748b", padding: "3px 8px", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "3px", whiteSpace: "nowrap" }}>
                🔑 PIN
              </button>
              <button onClick={() => setCurrentUser(null)} title="Sign out"
                style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer", color: "#64748b", padding: "3px 8px", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "3px", whiteSpace: "nowrap" }}>
                ↩ Sign out
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "8px", padding: "3px" }}>
            <select value={month} onChange={e => setMonth(Number(e.target.value))}
              style={{ fontSize: "12px", padding: "5px 8px", border: "none", background: "white", borderRadius: "6px", color: "#1e293b", fontWeight: 500, cursor: "pointer" }}>
              {MONTH_NAMES.map((n,i) => <option key={i} value={i+1}>{n}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              style={{ fontSize: "12px", padding: "5px 8px", border: "none", background: "white", borderRadius: "6px", color: "#1e293b", fontWeight: 500, cursor: "pointer" }}>
              {[2025,2026,2027].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          {canEdit && <>
            <button onClick={() => { setGenerating(true); setTimeout(() => { setSavedRosterMonth(null); setManualOverrides({}); setGenerating(false); }, 900); }}
              disabled={generating}
              style={{ background: generating ? "#93c5fd" : "#1d4ed8", color: "white", border: "none", padding: "7px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: generating ? "default" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className={`ti ${generating ? "ti-refresh" : "ti-sparkles"}`} style={{ fontSize: "13px" }} aria-hidden="true"></i>
              {generating ? "Generating…" : "Preview Generate"}
            </button>
            <button onClick={() => handleSaveRosterSchedule(savedRosterMonth ? "updated" : "generated")}
              style={{ background: "#15803d", color: "white", border: "none", padding: "7px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-device-floppy" style={{ fontSize: "13px" }} aria-hidden="true"></i>Save roster
            </button>
            <button onClick={handleRegenerateAndReplaceSavedRoster}
              disabled={generating}
              style={{ background: "#f97316", color: "white", border: "none", padding: "7px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: generating ? "default" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-refresh" style={{ fontSize: "13px" }} aria-hidden="true"></i>Regenerate & save
            </button>
          </>}
          <button onClick={handleExport}
            style={{ padding: "7px 14px", fontSize: "12px", borderRadius: "8px", background: "white", border: "1px solid #e2e8f0", color: "#374151", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <i className="ti ti-download" style={{ fontSize: "13px" }} aria-hidden="true"></i>Export Excel
          </button>
          {showExportMsg && <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 500 }}>✓ Exported</span>}
          {rosterSaveMsg && <span style={{ fontSize: "12px", color: rosterSaveMsg.startsWith("✓") ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{rosterSaveMsg}</span>}
        </div>
      </div>

      {!canEdit && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", padding: "9px 16px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <i className="ti ti-eye" style={{ fontSize: "15px", color: "#15803d" }} aria-hidden="true"></i>
          <span style={{ fontSize: "12px", color: "#166534" }}>
            You are signed in as <strong>{currentUser?.name}</strong> with <strong>View Only</strong> access. Contact a Lead or Manager to request changes.
          </span>
        </div>
      )}
      <div style={{ display: "flex", gap: "2px", marginBottom: "16px", background: "#f1f5f9", borderRadius: "10px", padding: "4px" }}>
        {[["roster","Calendar Roster","ti-calendar"],["team","Team Members","ti-users"],["weeklyoff","Weekly Off","ti-calendar-off"],
           ...(canEdit ? [["adhoc","Adhoc & Overrides","ti-adjustments-horizontal"],["conditions","Conditions","ti-settings"]] : []),
           ["audit","Audit & Stats","ti-chart-bar"]].map(([id, label, icon]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{
              flex: 1, padding: "8px 12px", border: "none", borderRadius: "7px", cursor: "pointer",
              background: tab === id ? "white" : "transparent",
              color: tab === id ? "#1d4ed8" : "#64748b",
              fontWeight: tab === id ? 600 : 400, fontSize: "13px",
              boxShadow: tab === id ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}>
            <i className={`ti ${icon}`} style={{ fontSize: "14px" }} aria-hidden="true"></i>
            {label}
          </button>
        ))}
      </div>

      {/* ══ ROSTER TAB ══ */}
      {tab === "roster" && (
        <div>
          <FilterBar
            filters={rosterFilters} setFilters={setRosterFilters}
            extraFilters={rosterExtra} setExtraFilters={setRosterExtra}
            uniqueNames={uniqueNames} uniqueRoles={uniqueRoles} uniqueTechs={uniqueTechs} uniqueLocs={uniqueLocs} uniqueCities={uniqueCities}
            extraOptions={[["Shift", "shift", uniqueShifts, shiftColorMap]]}
          />

          {/* Single-date view: narrow the whole roster grid down to just one date */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 14px" }}>
            <i className="ti ti-calendar-event" style={{ fontSize: "13px", color: "#64748b" }} aria-hidden="true"></i>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>View date:</span>
            <input type="date" value={singleDate}
              min={`${year}-${padM}-01`}
              max={`${year}-${padM}-${String(daysInMonthCount).padStart(2,"0")}`}
              onChange={e => setSingleDate(e.target.value)}
              style={{ padding: "5px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "12px", color: "#374151" }} />
            {singleDateDay && (
              <>
                <span style={{ fontSize: "12px", color: "#1d4ed8", fontWeight: 600 }}>
                  Showing {monthName} {singleDateDay} only
                </span>
                <button onClick={() => setSingleDate("")}
                  style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", color: "#dc2626", background: "#fef2f2", border: "1px solid #fca5a5", cursor: "pointer", fontWeight: 500 }}>
                  ✕ Show full month
                </button>
              </>
            )}
          </div>

          {/* Shift legend */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px", alignItems: "center" }}>
            {SHIFTS_LIST.map(s => {
              const c = SHIFT_COLORS[s];
              return (
                <span key={s} onClick={() => setRosterExtra(f => ({...f, shift: f.shift?.includes(s) ? f.shift.filter(x => x !== s) : [...(f.shift || []), s]}))}
                  style={{
                    fontSize: "11px", padding: "3px 10px", borderRadius: "5px", fontWeight: 600,
                    background: c.bg, color: c.text, border: `1.5px solid ${rosterExtra.shift?.includes(s) ? c.text : c.border}`,
                    cursor: "pointer", outline: rosterExtra.shift?.includes(s) ? `2px solid ${c.border}` : "none", outlineOffset: "1px"
                  }}>
                  {s}
                </span>
              );
            })}
            <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "6px" }}>
              {canEdit ? "Click shift badge or filter to highlight · Click cell to override" : "Click shift badge or filter to highlight · View only"}
            </span>
          </div>

          <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "70vh", borderRadius: "10px", border: "2px solid #cbd5e1", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", scrollbarWidth: "thin" }}>
            <table style={{ borderCollapse: "collapse", fontSize: "11px", tableLayout: "fixed", minWidth: "max-content", width: "100%" }}>
              <colgroup>
                <col style={{ width: "190px" }} />
                <col style={{ width: "145px" }} />
                <col style={{ width: "95px" }} />
                <col style={{ width: "82px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "130px" }} />
                {visibleDays.map(d => <col key={d.date} style={{ width: "32px" }} />)}
                <col style={{ width: "50px" }} />
                <col style={{ width: "42px" }} />
              </colgroup>
              <thead>
                <tr>
                  {[["Resource",0],["Role",190],["Tech",335],["Location",430],["City",512]].map(([h, left]) => (
                    <th key={h} style={{ ...TH_BASE, position: "sticky", top: 0, left: left, zIndex: 25, boxShadow: h === "City" ? "2px 0 6px rgba(0,0,0,0.08)" : "none" }}>{h}</th>
                  ))}
                  <th style={{ ...TH_BASE, position: "sticky", top: 0, zIndex: 15 }}>Contact</th>
                  {visibleDays.map(d => (
                    <th key={d.date} style={{
                      ...TH_BASE, textAlign: "center", padding: "5px 2px",
                      position: "sticky", top: 0, zIndex: 15,
                      background: d.isWeekend ? "#fef3c7" : "#f1f5f9",
                      borderBottom: `2px solid ${d.isWeekend ? "#f59e0b" : "#94a3b8"}`,
                      color: d.isWeekend ? "#92400e" : "#475569",
                    }}>
                      <div style={{ fontWeight: 700, fontSize: "11px" }}>{d.date}</div>
                      <div style={{ fontSize: "9px", fontWeight: 500 }}>{["Su","Mo","Tu","We","Th","Fr","Sa"][d.dayOfWeek]}</div>
                    </th>
                  ))}
                  <th style={{ ...TH_BASE, textAlign: "center", position: "sticky", top: 0, zIndex: 15 }}>Days</th>
                  <th style={{ ...TH_BASE, textAlign: "center", position: "sticky", top: 0, zIndex: 15 }}>Off</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoster.map((member, idx) => {
                  const st = stats[member.id];
                  return (
                    <tr key={member.id}
                      style={{ background: idx % 2 === 0 ? "white" : "#f8fafc" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "white" : "#f8fafc"}>
                      <td style={{ ...TD, padding: "7px 12px", whiteSpace: "nowrap", position: "sticky", left: 0, background: "inherit", zIndex: 5, boxShadow: "none" }}>
                        <span style={{ fontSize: "12px", fontWeight: member.isLead || member.isManager ? 700 : 400, color: "#0f172a" }}>{member.name}</span>
                      </td>
                      <td style={{ ...TD, padding: "7px 10px", fontSize: "11px", color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", position: "sticky", left: 190, background: "inherit", zIndex: 5 }}>{member.role}</td>
                      <td style={{ ...TD, padding: "7px 10px", position: "sticky", left: 335, background: "inherit", zIndex: 5 }}>
                        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", fontWeight: 600, background: (TECH_COLORS[member.tech]||"#666") + "18", color: TECH_COLORS[member.tech]||"#666" }}>{member.tech}</span>
                      </td>
                      <td style={{ ...TD, padding: "7px 10px", position: "sticky", left: 430, background: "inherit", zIndex: 5 }}>
                        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", fontWeight: 600, background: member.location === "Onsite" ? "#dcfce7" : "#dbeafe", color: member.location === "Onsite" ? "#166534" : "#1e40af" }}>{member.location}</span>
                      </td>
                      <td style={{ ...TD, padding: "7px 10px", fontSize: "11px", color: "#475569", whiteSpace: "nowrap", position: "sticky", left: 512, background: "inherit", zIndex: 5, boxShadow: "2px 0 6px rgba(0,0,0,0.08)" }}>
                        {member.city ? (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <i className="ti ti-map-pin" style={{ fontSize: "11px", color: "#94a3b8" }} aria-hidden="true"></i>
                            {member.city}
                          </span>
                        ) : <span style={{ color: "#cbd5e1" }}>—</span>}
                      </td>
                      <td style={{ ...TD, padding: "7px 10px", fontSize: "11px", color: "#475569", whiteSpace: "nowrap" }}>
                        {member.phone ? (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <i className="ti ti-phone" style={{ fontSize: "11px", color: "#94a3b8" }} aria-hidden="true"></i>
                            {member.phone}
                          </span>
                        ) : <span style={{ color: "#cbd5e1" }}>—</span>}
                      </td>
                      {visibleDays.map(d => {
                        const shift = roster[member.id]?.[d.date] || "OFF";
                        const col = SHIFT_COLORS[shift] || SHIFT_COLORS.OFF;
                        const isSel = selectedCell?.memberId === member.id && selectedCell?.date === d.date;
                        const isHighlighted = rosterExtra.shift && rosterExtra.shift.length > 0 && rosterExtra.shift.includes(shift);
                        return (
                          <td key={d.date} onClick={() => canEdit ? setSelectedCell(s => (s?.memberId===member.id && s?.date===d.date) ? null : {memberId:member.id, date:d.date}) : null}
                            style={{
                              ...TD, padding: "0", textAlign: "center", cursor: "pointer",
                              background: isSel ? "#1d4ed8" : isHighlighted ? col.bg : (d.isWeekend ? "#fffbeb" : col.bg),
                              outline: isSel ? "2px solid #1d4ed8" : isHighlighted ? `2px solid ${col.border}` : "none",
                              outlineOffset: "-2px",
                            }}>
                            <span style={{ fontSize: "9px", fontWeight: 700, color: isSel ? "white" : col.text, display: "block", padding: "5px 0", letterSpacing: "0.2px" }}>{shift}</span>
                          </td>
                        );
                      })}
                      <td style={{ textAlign: "center", padding: "7px 4px", fontWeight: 700, fontSize: "12px", color: st.workDays === targetWorkDays ? "#166534" : "#dc2626", borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0" }}>{st.workDays}</td>
                      <td style={{ textAlign: "center", padding: "7px 4px", color: "#6b7280", fontSize: "12px", borderBottom: "1px solid #e2e8f0" }}>{st.offDays}</td>
                    </tr>
                  );
                })}
                {filteredRoster.length === 0 && (
                  <tr><td colSpan={visibleDays.length + 8} style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>No resources match the current filters</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Override panel */}
          {selectedCell && (
            <div style={{ marginTop: "12px", padding: "12px 16px", background: "white", border: "1.5px solid #3b82f6", borderRadius: "10px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <i className="ti ti-edit" style={{ fontSize: "15px", color: "#1d4ed8" }} aria-hidden="true"></i>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>
                Override: {teamMembers.find(m => m.id === selectedCell.memberId)?.name} · {monthName} {selectedCell.date}
              </span>
              {SHIFTS_LIST.map(s => {
                const c = SHIFT_COLORS[s];
                return (
                  <button key={s} onClick={() => handleShiftChange(s)}
                    style={{ fontSize: "11px", padding: "4px 12px", borderRadius: "5px", background: c.bg, color: c.text, border: `1.5px solid ${c.border}`, cursor: "pointer", fontWeight: 700 }}>
                    {s}
                  </button>
                );
              })}
              <button onClick={() => setSelectedCell(null)} style={{ marginLeft: "auto", fontSize: "11px", padding: "4px 12px", borderRadius: "5px", background: "#f1f5f9", border: "1px solid #e2e8f0", cursor: "pointer" }}>Cancel</button>
            </div>
          )}
        </div>
      )}

      {/* ══ TEAM TAB ══ */}
      {tab === "team" && (
        <div>
          {canEdit && memberModal === "add" && <MemberModal onSave={handleAddMember} onClose={() => setMemberModal(null)} />}
          {canEdit && memberModal?.member && <MemberModal member={memberModal.member} onSave={handleEditMember} onClose={() => setMemberModal(null)} />}
          {canEdit && deleteTarget && <DeleteConfirm member={deleteTarget} onConfirm={handleDeleteMember} onClose={() => setDeleteTarget(null)} />}

          <FilterBar filters={teamFilters} setFilters={setTeamFilters} uniqueNames={uniqueNames} uniqueRoles={uniqueRoles} uniqueTechs={uniqueTechs} uniqueLocs={uniqueLocs} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
              Showing <strong>{filteredTeam.length}</strong> of <strong>{teamMembers.length}</strong> members ·
              <span style={{ marginLeft: "6px" }}>{teamMembers.filter(m=>m.location==="Onsite").length} onsite · {teamMembers.filter(m=>m.location==="Offshore").length} offshore</span>
            </p>
            {canEdit && (
              <button onClick={() => setMemberModal("add")}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 16px", borderRadius: "8px", background: "#1d4ed8", color: "white", border: "none", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                <i className="ti ti-user-plus" style={{ fontSize: "14px" }} aria-hidden="true"></i>Add member
              </button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "10px" }}>
            {filteredTeam.map(m => {
              const st = stats[m.id] || { workDays: 0, we: 0 };
              const initials = m.name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
              return (
                <div key={m.id} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", position: "relative" }}>
                  {canEdit && (
                    <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "4px" }}>
                      <button onClick={() => setMemberModal({ member: m })} title="Edit"
                        style={{ width: "26px", height: "26px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                        <i className="ti ti-edit" style={{ fontSize: "13px" }} aria-hidden="true"></i>
                      </button>
                      <button onClick={() => setDeleteTarget(m)} title="Remove"
                        style={{ width: "26px", height: "26px", borderRadius: "6px", border: "1px solid #fca5a5", background: "#fef2f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626" }}>
                        <i className="ti ti-trash" style={{ fontSize: "13px" }} aria-hidden="true"></i>
                      </button>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", paddingRight: "62px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: TECH_COLORS[m.tech]||"#666", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, margin: 0, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</p>
                      <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>{m.role}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "10px" }}>
                    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", fontWeight: 600, background: (TECH_COLORS[m.tech]||"#666")+"18", color: TECH_COLORS[m.tech]||"#666" }}>{m.tech}</span>
                    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "5px", fontWeight: 600, background: m.location==="Onsite"?"#dcfce7":"#dbeafe", color: m.location==="Onsite"?"#166534":"#1e40af" }}>{m.location}</span>
                    {m.city && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "#f1f5f9", color: "#475569", display: "flex", alignItems: "center", gap: "3px" }}><i className="ti ti-map-pin" style={{ fontSize: "10px" }} aria-hidden="true"></i>{m.city}</span>}
                    {m.designation && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "#eef2ff", color: "#4338ca", fontWeight: 700 }}>Designation: {m.designation}</span>}
                    {m.isLead    && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "#fef3c7", color: "#92400e", fontWeight: 600 }}>Lead</span>}
                    {m.isSenior  && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "#ede9fe", color: "#4c1d95", fontWeight: 600 }}>Senior</span>}
                    {m.isManager && <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "4px", background: "#fee2e2", color: "#991b1b", fontWeight: 600 }}>Manager</span>}
                  </div>
                  {m.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px", fontSize: "11px", color: "#64748b" }}>
                      <i className="ti ti-phone" style={{ fontSize: "11px", color: "#94a3b8" }} aria-hidden="true"></i>
                      {m.phone}
                    </div>
                  )}
                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "#64748b" }}>Work days</span>
                    <span style={{ fontWeight: 700, color: st.workDays === targetWorkDays ? "#166534" : "#dc2626" }}>{st.workDays} / {days.length}</span>
                  </div>
                  {st.we > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginTop: "5px" }}>
                      <span style={{ color: "#64748b" }}>Weekend shifts</span>
                      <span style={{ fontWeight: 600 }}>{st.we}</span>
                    </div>
                  )}
                </div>
              );
            })}
            {canEdit && (
              <div onClick={() => setMemberModal("add")}
                style={{ border: "2px dashed #cbd5e1", borderRadius: "10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", minHeight: "130px", color: "#94a3b8", background: "#fafbfc" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="#1d4ed8"; e.currentTarget.style.color="#1d4ed8"; e.currentTarget.style.background="#eff6ff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#cbd5e1"; e.currentTarget.style.color="#94a3b8"; e.currentTarget.style.background="#fafbfc"; }}>
                <i className="ti ti-user-plus" style={{ fontSize: "24px" }} aria-hidden="true"></i>
                <span style={{ fontSize: "12px", fontWeight: 600 }}>Add new member</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ WEEKLY OFF TAB ══ */}
      {tab === "weeklyoff" && (
        <div>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "14px" }}>
            Weekly off schedule for all {teamMembers.length} resources in {monthName} {year}. Leads & Managers get Sat+Sun off every week. Team members may have Fri/Sat, Sat/Sun, or Sun/Mon week-offs based on roster balancing and weekend coverage.
          </p>

          {/* Summary legend */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
            {[
              ["Sat/Sun (full off)", "#fef3c7", "#92400e"],
              ["Sat/Sun + WE coverage", "#dbeafe", "#1e40af"],
            ].map(([lbl,bg,col]) => (
              <span key={lbl} style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "5px", background: bg, color: col, fontWeight: 600, border: `1px solid ${col}30` }}>{lbl}</span>
            ))}
          </div>

          <div style={{ overflowX: "auto", borderRadius: "10px", border: "2px solid #cbd5e1", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <table style={{ borderCollapse: "collapse", fontSize: "11px", tableLayout: "fixed", minWidth: "max-content", width: "100%" }}>
              <colgroup>
                <col style={{ width: "32px" }} />
                <col style={{ width: "190px" }} />
                <col style={{ width: "95px" }} />
                <col style={{ width: "145px" }} />
                <col style={{ width: "130px" }} />
                {Array.from({ length: Math.ceil(days.length / 7) }, (_, i) => <col key={i} style={{ width: "110px" }} />)}
                <col style={{ width: "60px" }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={TH_BASE}>#</th>
                  <th style={TH_BASE}>Resource</th>
                  <th style={TH_BASE}>Tech</th>
                  <th style={TH_BASE}>Role</th>
                  <th style={TH_BASE}>Off Pattern</th>
                  {Array.from({ length: Math.ceil(days.length / 7) }, (_, i) => {
                    const wkDays = days.filter(d => Math.floor((d.date - 1) / 7) === i);
                    const first = wkDays[0]?.date, last = wkDays[wkDays.length - 1]?.date;
                    return <th key={i} style={{ ...TH_BASE, textAlign: "center" }}>Wk{i+1} ({monthName.slice(0,3)} {first}–{last})</th>;
                  })}
                  <th style={{ ...TH_BASE, textAlign: "center" }}>Total Off</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((m, idx) => {
                  const memberRoster = roster[m.id] || {};
                  // Find off days per week
                  const weekCount = Math.ceil(days.length / 7);
                  const weekOffDays = Array.from({ length: weekCount }, (_, wi) => {
                    const wkDays = days.filter(d => Math.floor((d.date - 1) / 7) === wi);
                    return wkDays.filter(d => memberRoster[d.date] === "OFF").map(d => d.date);
                  });
                  const totalOff = days.filter(d => memberRoster[d.date] === "OFF").length;

                  // Detect off pattern: all members are Sat/Sun based
                  // Distinguish full Sat/Sun (managers/leads/pattern0) from those with WE coverage
                  const hasWeekendWork = days.some(d => {
                    const s = memberRoster[d.date];
                    return s === "WS1" || s === "WS2";
                  });
                  const pattern  = hasWeekendWork ? "Sat/Sun + WE coverage" : "Sat/Sun (full off)";
                  const patBg    = hasWeekendWork ? "#dbeafe" : "#fef3c7";
                  const patCol   = hasWeekendWork ? "#1e40af" : "#92400e";

                  return (
                    <tr key={m.id} style={{ background: idx % 2 === 0 ? "white" : "#f8fafc" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "white" : "#f8fafc"}>
                      <td style={{ ...TD, textAlign: "center", padding: "7px 6px", color: "#94a3b8", fontSize: "11px" }}>{idx + 1}</td>
                      <td style={{ ...TD, padding: "7px 12px", whiteSpace: "nowrap", fontWeight: m.isLead || m.isManager ? 700 : 400, color: "#0f172a", fontSize: "12px" }}>{m.name}</td>
                      <td style={{ ...TD, padding: "7px 10px" }}>
                        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", fontWeight: 600, background: (TECH_COLORS[m.tech]||"#666")+"18", color: TECH_COLORS[m.tech]||"#666" }}>{m.tech}</span>
                      </td>
                      <td style={{ ...TD, padding: "7px 10px", color: "#64748b", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.role}</td>
                      <td style={{ ...TD, padding: "7px 10px" }}>
                        <span style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "5px", fontWeight: 600, background: patBg, color: patCol }}>{pattern}</span>
                      </td>
                      {weekOffDays.map((offList, wi) => {
                        const dayOfWeekNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];
                        return (
                          <td key={wi} style={{ ...TD, padding: "7px 8px", textAlign: "center" }}>
                            {offList.length === 0
                              ? <span style={{ fontSize: "11px", color: "#cbd5e1" }}>—</span>
                              : (
                                <div style={{ display: "flex", gap: "4px", justifyContent: "center", flexWrap: "wrap" }}>
                                  {offList.map(d => {
                                    const dow = days.find(x => x.date === d)?.dayOfWeek;
                                    const isWE = dow === 0 || dow === 6;
                                    return (
                                      <span key={d} style={{
                                        fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: 600,
                                        background: isWE ? "#fef3c7" : "#f1f5f9",
                                        color: isWE ? "#92400e" : "#475569",
                                        border: `1px solid ${isWE ? "#f59e0b" : "#e2e8f0"}`,
                                      }}>
                                        {d}{dow !== undefined ? ` ${dayOfWeekNames[dow]}` : ""}
                                      </span>
                                    );
                                  })}
                                </div>
                              )
                            }
                          </td>
                        );
                      })}
                      <td style={{ ...TD, textAlign: "center", padding: "7px 8px", fontWeight: 700, color: "#1d4ed8", fontSize: "12px" }}>{totalOff}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ ADHOC & OVERRIDES TAB ══ */}
      {tab === "adhoc" && <AdhocTab
        adhocForm={adhocForm} setAdhocForm={setAdhocForm}
        adhocList={adhocList} setAdhocList={setAdhocList}
        adhocMsg={adhocMsg} setAdhocMsg={setAdhocMsg}
        roster={roster} month={month} year={year} monthName={monthName}
        manualOverrides={manualOverrides} setManualOverrides={setManualOverrides}
        TH_BASE={TH_BASE} TD={TD} teamMembers={teamMembers}
      />}

      {/* ══ CONDITIONS TAB ══ */}
      {tab === "conditions" && (
        <div>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>Adjust scheduling rules then click "Apply & generate" to rebuild the roster.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "14px" }}>
            {[
              ["ti-users", "Team & work limits",
                <>{[["Onsite members","onsiteCount",1,10],["Offshore members","offshoreCount",1,50],["Min days/month","minDaysPerMonth",15,26],["Max days/week","maxDaysPerWeek",4,7]].map(([lbl,key,mn,mx]) => (
                  <div key={key} style={{ marginBottom: "10px" }}>
                    <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "4px" }}>{lbl}</label>
                    <input type="number" min={mn} max={mx} value={conditions[key]} onChange={e => setConditions(c=>({...c,[key]:+e.target.value}))} style={{ width: "100%", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "13px" }} />
                  </div>
                ))}</>
              ],
              ["ti-clock", "Weekday shift timings (IST)",
                <>{[["Shift 1","weekdayShift1"],["Shift 2","weekdayShift2"]].map(([lbl,key]) => (
                  <div key={key} style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", fontWeight: 500 }}>{lbl}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div><label style={{ fontSize: "11px", color: "#94a3b8" }}>Start</label><input type="time" value={conditions[key].istStart} onChange={e=>setConditions(c=>({...c,[key]:{...c[key],istStart:e.target.value}}))} style={{ width: "100%", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }} /></div>
                      <div><label style={{ fontSize: "11px", color: "#94a3b8" }}>End</label><input type="time" value={conditions[key].istEnd} onChange={e=>setConditions(c=>({...c,[key]:{...c[key],istEnd:e.target.value}}))} style={{ width: "100%", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }} /></div>
                    </div>
                  </div>
                ))}</>
              ],
              ["ti-beach", "Weekend shift timings (IST)",
                <>{[["WS1 (Weekend Shift 1)","weekendShift1"],["WS2 (Weekend Shift 2)","weekendShift2"]].map(([lbl,key]) => (
                  <div key={key} style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", fontWeight: 500 }}>{lbl}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div><label style={{ fontSize: "11px", color: "#94a3b8" }}>Start</label><input type="time" value={conditions[key].istStart} onChange={e=>setConditions(c=>({...c,[key]:{...c[key],istStart:e.target.value}}))} style={{ width: "100%", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }} /></div>
                      <div><label style={{ fontSize: "11px", color: "#94a3b8" }}>End</label><input type="time" value={conditions[key].istEnd} onChange={e=>setConditions(c=>({...c,[key]:{...c[key],istEnd:e.target.value}}))} style={{ width: "100%", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px" }} /></div>
                    </div>
                  </div>
                ))}</>
              ],
              ["ti-layers-intersect", "Min tech coverage per shift",
                <>{["IDMC","Databricks","Oracle"].map(tech => (
                  <div key={tech} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: TECH_COLORS[tech], display: "inline-block" }}></span>
                      <span style={{ fontSize: "12px", fontWeight: 500 }}>{tech}</span>
                    </div>
                    <input type="number" min="1" max="5" value={conditions.techCoveragePerShift[tech]} onChange={e=>setConditions(c=>({...c,techCoveragePerShift:{...c.techCoveragePerShift,[tech]:+e.target.value}}))} style={{ width: "64px", textAlign: "center", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "13px" }} />
                  </div>
                ))}</>
              ],
              ["ti-shield-check", "Scheduling policies",
                <>{[["noNightShiftOffshore","No night shifts for offshore"],["noWeekendForLeads","No weekend for leads"],["alternateWeekends","Alternate weekend assignments"],["seniorJuniorMix","Mix senior & junior per shift"]].map(([key,lbl]) => (
                  <label key={key} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", cursor: "pointer", padding: "8px 10px", marginBottom: "6px", border: `1px solid ${conditions[key] ? "#93c5fd" : "#e2e8f0"}`, borderRadius: "7px", background: conditions[key] ? "#eff6ff" : "#f8fafc" }}>
                    <input type="checkbox" checked={conditions[key]} onChange={e=>setConditions(c=>({...c,[key]:e.target.checked}))} style={{ width: "14px", height: "14px", accentColor: "#1d4ed8" }} />
                    <span style={{ color: conditions[key] ? "#1d4ed8" : "#64748b", fontWeight: conditions[key] ? 500 : 400 }}>{lbl}</span>
                  </label>
                ))}</>
              ],
              ["ti-calendar-off", "Week-off policy",
                <>
                  <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 12px", marginBottom: "10px" }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#92400e", margin: "0 0 4px" }}>Managers & Leads</p>
                    <p style={{ fontSize: "11px", color: "#78350f", margin: 0, lineHeight: 1.5 }}>Saturday + Sunday off every week. No weekend shifts.</p>
                  </div>
                  <div style={{ background: "#dbeafe", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px 12px" }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#1e40af", margin: "0 0 4px" }}>Team Members</p>
                    <p style={{ fontSize: "11px", color: "#1e3a8a", margin: 0, lineHeight: 1.5 }}>
                      Saturday + Sunday off every week.<br/>
                      On <strong>alternate weekends</strong> one day is a coverage shift:<br/>
                      — Both WS1 and WS2 run on every Saturday and Sunday<br/>
                      — Minimum 2 people on WS1 + minimum 2 on WS2 per weekend day; maximum 4 per shift is allowed<br/>
                      — Every weekend shift must include at least one A/PA and one PAT; no all-PAT weekend shift<br/>
                      No consecutive weekend shifts across month boundaries. Monthly working days must be equal for all resources.
                    </p>
                  </div>
                </>
              ],
            ].map(([icon, title, content]) => (
              <div key={title} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "12px", color: "#0f172a", display: "flex", alignItems: "center", gap: "7px" }}>
                  <i className={`ti ${icon}`} style={{ fontSize: "15px", color: "#1d4ed8" }} aria-hidden="true"></i>{title}
                </p>
                {content}
              </div>
            ))}
          </div>
          <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
            <button onClick={() => { setGenerating(true); setTimeout(() => { setSavedRosterMonth(null); setManualOverrides({}); setGenerating(false); setTab("roster"); }, 900); }}
              style={{ background: "#1d4ed8", color: "white", border: "none", padding: "9px 22px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-sparkles" style={{ fontSize: "13px" }} aria-hidden="true"></i>Apply & generate roster
            </button>
            <button onClick={() => setConditions(DEFAULT_CONDITIONS)}
              style={{ padding: "9px 18px", fontSize: "13px", borderRadius: "8px", background: "white", border: "1px solid #e2e8f0", color: "#374151", cursor: "pointer" }}>
              Reset to defaults
            </button>
          </div>

          {/* PIN Management — managers only */}
          {currentUser?.isManager && (
            <PinManager teamMembers={teamMembers} setTeamMembers={setTeamMembers} />
          )}
        </div>
      )}

      {/* ══ AUDIT TAB ══ */}
      {tab === "audit" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))", gap: "10px", marginBottom: "16px" }}>
            {[["Avg days",avgWorkDays,"ti-calendar","#1d4ed8","#eff6ff"],["Min days",minDays,"ti-arrow-down","#dc2626","#fef2f2"],["Max days",maxDays,"ti-arrow-up","#166534","#f0fdf4"],["Fairness",`${fairness}%`,"ti-star","#d97706","#fffbeb"],["Members",teamMembers.length,"ti-users","#7c3aed","#f5f3ff"],["Exact days",`${Object.values(stats).filter(s=>s.workDays===targetWorkDays).length}/${teamMembers.length}`,"ti-check","#0891b2","#ecfeff"]].map(([lbl,val,icon,col,bg]) => (
              <div key={lbl} style={{ background: bg, border: `1px solid ${col}30`, borderRadius: "8px", padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
                  <i className={`ti ${icon}`} style={{ fontSize: "13px", color: col }} aria-hidden="true"></i>
                  <span style={{ fontSize: "10px", color: col, fontWeight: 500 }}>{lbl}</span>
                </div>
                <span style={{ fontSize: "18px", fontWeight: 700, color: col }}>{val}</span>
              </div>
            ))}
          </div>

          <FilterBar
            filters={auditFilters} setFilters={setAuditFilters}
            extraFilters={auditExtra} setExtraFilters={setAuditExtra}
            uniqueNames={uniqueNames} uniqueRoles={uniqueRoles} uniqueTechs={uniqueTechs} uniqueLocs={uniqueLocs}
            extraOptions={[["Status","status",uniqueStatus]]}
          />

          <div style={{ overflowX: "auto", borderRadius: "10px", border: "2px solid #cbd5e1", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <table style={{ borderCollapse: "collapse", fontSize: "12px", width: "100%" }}>
              <thead>
                <tr>
                  {["#","Resource","Tech","Role","Location","S1","S2","GEN","WE","Total","Off","Status"].map((h,i) => (
                    <th key={h} style={{ ...TH_BASE, textAlign: i >= 5 ? "center" : "left", width: i === 0 ? "36px" : i >= 5 ? "48px" : undefined }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAudit.map((m, i) => {
                  const st = stats[m.id];
                  const ok = st.workDays === targetWorkDays;
                  return (
                    <tr key={m.id} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}
                      onMouseEnter={e => e.currentTarget.style.background="#eff6ff"}
                      onMouseLeave={e => e.currentTarget.style.background= i%2===0?"white":"#f8fafc"}>
                      <td style={{ ...TD, textAlign: "center", padding: "7px 8px", color: "#94a3b8", fontSize: "11px" }}>{i+1}</td>
                      <td style={{ ...TD, padding: "7px 12px", whiteSpace: "nowrap", fontWeight: m.isLead||m.isManager ? 700 : 400, color: "#0f172a" }}>{m.name}</td>
                      <td style={{ ...TD, padding: "7px 10px" }}>
                        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", fontWeight: 600, background: (TECH_COLORS[m.tech]||"#666")+"18", color: TECH_COLORS[m.tech]||"#666" }}>{m.tech}</span>
                      </td>
                      <td style={{ ...TD, padding: "7px 10px", color: "#64748b", fontSize: "11px", whiteSpace: "nowrap" }}>{m.role}</td>
                      <td style={{ ...TD, padding: "7px 10px" }}>
                        <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", fontWeight: 600, background: m.location==="Onsite"?"#dcfce7":"#dbeafe", color: m.location==="Onsite"?"#166534":"#1e40af" }}>{m.location}</span>
                      </td>
                      {[st.s1, st.s2, st.workDays-st.s1-st.s2-st.we, st.we].map((v, vi) => (
                        <td key={vi} style={{ ...TD, textAlign: "center", padding: "7px 6px", color: v===0?"#cbd5e1":"#374151", fontWeight: v>0?500:400 }}>{v||"—"}</td>
                      ))}
                      <td style={{ ...TD, textAlign: "center", padding: "7px 6px", fontWeight: 700, color: ok?"#166534":"#dc2626" }}>{st.workDays}</td>
                      <td style={{ ...TD, textAlign: "center", padding: "7px 6px", color: "#6b7280" }}>{st.offDays}</td>
                      <td style={{ ...TD, padding: "7px 10px" }}>
                        <span style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "5px", fontWeight: 700, background: ok?"#dcfce7":"#fee2e2", color: ok?"#166534":"#dc2626" }}>
                          {ok ? "✓ OK" : "⚠ Review"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredAudit.length === 0 && (
                  <tr><td colSpan={12} style={{ padding: "2.5rem", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>No resources match the current filters</td></tr>
                )}
                <tr style={{ background: "#f1f5f9", fontWeight: 700, borderTop: "2px solid #94a3b8" }}>
                  <td colSpan={5} style={{ padding: "8px 12px", fontSize: "12px", textAlign: "right", color: "#475569" }}>Totals ({filteredAudit.length} shown)</td>
                  {["s1","s2"].map(k => <td key={k} style={{ textAlign:"center", padding:"8px 6px", fontSize:"12px" }}>{filteredAudit.reduce((a,m)=>a+stats[m.id][k],0)}</td>)}
                  <td style={{ textAlign:"center", padding:"8px 6px", fontSize:"12px" }}>{filteredAudit.reduce((a,m)=>a+(stats[m.id].workDays-stats[m.id].s1-stats[m.id].s2-stats[m.id].we),0)}</td>
                  <td style={{ textAlign:"center", padding:"8px 6px", fontSize:"12px" }}>{filteredAudit.reduce((a,m)=>a+stats[m.id].we,0)}</td>
                  <td style={{ textAlign:"center", padding:"8px 6px", fontSize:"12px" }}>{filteredAudit.reduce((a,m)=>a+stats[m.id].workDays,0)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
