# FutoNav — Product Requirements Document

## Overview

FutoNav is a smart campus navigation system for the Federal University of Technology, Owerri (FUTO). It provides offline-capable turn-by-turn walking directions to 54+ surveyed campus Points of Interest (POIs), optimized for the unique constraints of campus GPS, network coverage, and user needs.

## Target users

- FUTO students, staff, and visitors navigating the campus
- Especially new students during orientation who don't know building locations

## User stories

| ID | User story |
|---|---|
| US-01 | As a student, I want to search for a building by name or abbreviation so I can find it quickly. |
| US-02 | As a visitor, I want to see my current location on a campus map so I know where I am. |
| US-03 | As a user, I want to select a POI and see the distance and walking ETA so I can plan my trip. |
| US-04 | As a user, I want navigation guidance (route line) from my location to a selected POI. |
| US-05 | As a user, I want the app to work offline so I can navigate areas with poor connectivity. |

## Key differentiators

1. **Offline-first** — Core navigation works without internet after first sync
2. **Field-verified POIs** — 54+ buildings surveyed with ±10 m GPS accuracy
3. **FUTO-specific search** — Abbreviation and partial matching ("CSC", "SOE") that Google Maps can't do

## Release criteria (v1.0)

- All high-priority FRs pass functional testing
- App works fully offline after first sync
- Cold start ≤ 4 s, map ≤ 3 s, search ≤ 1 s
- No hardcoded secrets; RLS verified
- UAT completed with 15 students
- Production build on Play Store
