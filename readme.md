# Standard18 BACS Ecosystem

An open-source TypeScript ecosystem for working with **UK BACS Standard 18** files. Parse, validate, analyze, and repair BACS payment files — the ESLint of BACS.

[![CI](https://github.com/MuhammadTalha776932/standard18-bacs/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/MuhammadTalha776932/standard18-bacs/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Packages](#packages)
- [Data Model](#data-model)
- [Field Specifications](#field-specifications)
- [Validation Levels](#validation-levels)
- [Business Rules](#business-rules)
- [Data Record Length Handling](#data-record-length-handling)
- [REST API](#rest-api)
- [API Endpoints Detail](#api-endpoints-detail)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Building](#building)
- [Docker](#docker)
- [Deployment](#deployment)
- [CI / CD](#ci--cd)
- [Roadmap](#roadmap)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

UK BACS (Bankers' Automated Clearing System) files use the **Standard 18** fixed-width format. A single malformed line can cause a whole submission to be rejected by the bank. This project gives you:

- A **fully typed, tree-shakeable library** for working with Standard 18 files
- A **REST API** so non-TypeScript clients can validate/parse files over HTTP
- **Modular packages** so you pick only what you need
- **Deterministic, well-documented** behaviour aligned with real UK bank expectations

Current status: **pre-1.0**, actively developed.

---

## Features

| Feature | Status |
|---|---|
| Parse BACS files into typed `BacsFile` objects | ✅ |
| Validate files (levels 1–5: file, order, length, field, business) | ✅ |
| Support 100-byte (single processing date) data records | ✅ |
| Support 106-byte (multi processing date) data records | 🟡 Partial |
| Contra detection (debit 17 / credit 99 to originator) | ✅ |
| Duplicate detection (references, amount+account, account+reference) | ✅ |
| Business rule warnings (large payments, missing refs, etc.) | ✅ |
| Analyze files (totals, top destinations, warnings) | ✅ |
| Repair formatting issues (padding, length, reserved fields) | ✅ |
| REST API (`/validate`, `/parse`, `/analyze`, `/repair`) | ✅ |
| Swagger documentation | ✅ |
| Generator (JSON → BACS) | 🟡 Planned |
| CLI tool (`bacs validate …`) | 🟡 Planned |
| VS Code extension | 🟡 Planned |

---

## Tech Stack

- **Language** – TypeScript 5+
- **Runtime** – Node.js 22 LTS
- **Package manager** – pnpm 9
- **Monorepo** – Turborepo
- **Framework** – Express.js (API)
- **Validation** – Zod (request bodies)
- **Logging** – Pino
- **Docs** – Swagger UI
- **Testing** – Vitest
- **Build** – tsup (CJS + ESM + `.d.ts`)
- **Lint / format** – ESLint + Prettier
- **Git hooks** – Husky + lint-staged
- **CI** – GitHub Actions
- **Container** – Docker (multi-stage)

---

## Architecture

This is a monorepo with one deployable app (`apps/api`) and five libraries (`packages/*`). Each library is standalone, publishes CJS + ESM + `.d.ts`, and has zero runtime coupling beyond the packages it explicitly imports.

## Repository Layout

This is a **pnpm workspace** managed by **Turborepo**. The repository contains one deployable application (`apps/api`) and five reusable library packages (`packages/*`). Each library is independently versioned, tree-shakeable, and publishable to npm. Configuration files at the root are shared across every package.

### Top-Level Tree

