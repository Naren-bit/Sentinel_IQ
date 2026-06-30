/**
 * Sample Document — Fixed Demo Text
 * 
 * This document is designed to produce a BALANCED distribution of priority tiers:
 * - Obvious PII near the top (will score LOW/STANDARD — easy to spot, high confidence)
 * - Moderate PII in the middle (STANDARD tier)
 * - Subtle, non-canonical PII near the end (HIGH tier — the demo centerpiece)
 * 
 * The document simulates an internal HR incident report memo.
 */

const SAMPLE_DOCUMENT = `INTERNAL MEMORANDUM — CONFIDENTIAL
Greenfield Analytics, Inc.
Human Resources Department
Date: March 15, 2024

RE: Workplace Incident Report #2024-0312

This memorandum documents the incident reported by John Smith (Employee ID: EMP-4892) on March 12, 2024. Mr. Smith, a Senior Data Analyst in the Portland office, filed the report via the internal HR portal. He can be reached at john.smith@greenfield-analytics.com or by phone at (503) 555-0147 during business hours.

Summary of Incident:

On the morning of March 12, Mr. Smith reported that he discovered unauthorized access to his workstation. According to his statement, he arrived at approximately 8:15 AM and noticed that several files had been accessed overnight. The security badge logs confirm that badge number BDG-7291 was used to enter the building at 11:47 PM on March 11.

The IT security team, led by Maria Chen, conducted a preliminary investigation. Their findings indicate that the accessed files contained quarterly revenue projections and client contact information. Ms. Chen noted that the accessed directory included files belonging to the Westbrook Capital account, managed by account representative David Park, who can be contacted at dpark@greenfield-analytics.com.

Witness Statements:

Janet Morrison, the evening security guard on duty (shift 6PM-2AM), confirmed that she observed an individual entering the east wing at approximately 11:45 PM. She described the individual as wearing a company lanyard but did not verify their identity. Ms. Morrison's report has been filed separately under reference SEC-20240312-A.

The custodial staff member on the third floor, Roberto Vega, stated he saw someone at a workstation in the analytics department around midnight but assumed they were working late. Mr. Vega has worked for the company for twelve years and noted this was unusual activity for that floor.

IT Security Findings:

The security team's forensic analysis revealed that the following data was accessed during the unauthorized session. The intruder used a VPN configuration that routed through an external IP address 192.168.45.201 before connecting to the internal file server. Access logs show file downloads totaling 2.3 GB over approximately 90 minutes.

Client records for seventeen accounts were potentially exposed, including personally identifiable information. The most sensitive records belonged to individual clients rather than corporate accounts. Among the exposed records, the file containing social security information had entries formatted inconsistently — some as standard XXX-XX-XXXX and at least one entered as 587 23 4891 without proper formatting by the original data entry clerk.

Recommended Actions:

1. Immediately revoke access for badge BDG-7291 pending investigation.
2. Notify affected clients per the data breach protocol (see Policy HR-412).
3. Engage external forensics firm — approved vendor contact is Apex Digital Forensics.
4. Schedule interviews with all individuals who had after-hours access on March 11-12.

This matter has been escalated to the Chief Privacy Officer, Linda Zhao, whose direct line is 5035550193. Please also note that Mr. Smith's personal cell for follow-up outside business hours is 503.555.0184 and his home address is 4721 NE Hawthorne Blvd Apt 3B Portland OR 97213. All communications regarding this incident should reference case number PIR-2024-0312 and be marked confidential.

Prepared by: Angela Torres, HR Investigations
Distribution: CPO, General Counsel, IT Security Director`;

module.exports = { SAMPLE_DOCUMENT };
