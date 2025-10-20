
const templateContents: Record<string, string> = {
    'proj-proposal-01': `
# Project Proposal: [Project Title]

**Prepared for:** [Client/Stakeholder Name]
**Prepared by:** [Your Name/Company Name]
**Date:** ${new Date().toLocaleDateString()}

---

## 1. Executive Summary

A brief overview of the project, the problem it solves, and the proposed solution. This section should be compelling and concise, capturing the essence of the entire proposal.

## 2. Project Background & Problem Statement

Describe the current situation and the problem or opportunity this project addresses. Explain why this project is necessary now.

## 3. Goals and Objectives

- **Primary Goal:** [State the main goal of the project]
- **Objective 1:** [Specific, measurable, achievable, relevant, time-bound objective]
- **Objective 2:** [Specific, measurable, achievable, relevant, time-bound objective]
- **Objective 3:** [Specific, measurable, achievable, relevant, time-bound objective]

## 4. Scope of Work

Detail the specific tasks and deliverables that are included in this project.
- **In-Scope:**
    - Task A
    - Task B
    - Task C
- **Out-of-Scope:**
    - Task X
    - Task Y

## 5. Timeline

Provide a high-level project timeline with key phases and milestones.

| Phase             | Description                  | Estimated Duration |
|-------------------|------------------------------|--------------------|
| **Phase 1: Discovery**  | Research and requirements gathering | 2 Weeks            |
| **Phase 2: Design**     | Wireframing and UI/UX design  | 3 Weeks            |
| **Phase 3: Development**| Front-end and back-end coding | 6 Weeks            |
| **Phase 4: Testing**    | QA and user acceptance testing| 2 Weeks            |
| **Phase 5: Deployment** | Go-live and post-launch support | 1 Week             |

## 6. Budget

Provide a summary of the project costs.

| Item                | Cost        |
|---------------------|-------------|
| **Labor (Team)**      | $[Amount]   |
| **Software/Tools**  | $[Amount]   |
| **Contingency (15%)** | $[Amount]   |
| **Total**           | **$[Total]**|

## 7. Success Metrics

How will the success of this project be measured?
- Metric 1 (e.g., 20% increase in user engagement)
- Metric 2 (e.g., 15% reduction in operational costs)

---

**Next Steps:** Upon approval, we will schedule a kickoff meeting to finalize the project plan.
`,
    'nda-01': `
# Mutual Non-Disclosure Agreement

This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of ${new Date().toLocaleDateString()} ("Effective Date"), by and between **[Party A Name]**, located at [Party A Address] ("Party A"), and **[Party B Name]**, located at [Party B Address] ("Party B"), collectively referred to as the "Parties."

## 1. Purpose

The Parties wish to explore a potential business relationship (the "Purpose") and in connection with this Purpose, each Party may disclose certain confidential information to the other.

## 2. Definition of Confidential Information

"Confidential Information" means any and all non-public information disclosed by one Party (the "Disclosing Party") to the other (the "Receiving Party"), whether orally, visually, or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.

## 3. Obligations of Receiving Party

The Receiving Party shall:
(a) hold the Confidential Information in strict confidence and take all reasonable precautions to protect such Confidential Information.
(b) not disclose any Confidential Information to any third party.
(c) not use any Confidential Information for any purpose except for the Purpose.

## 4. Exclusions

Confidential Information does not include information that:
(a) is or becomes publicly known and made generally available through no wrongful act of the Receiving Party;
(b) is in the possession of the Receiving Party at the time of disclosure without any obligation of confidentiality;
(c) is independently developed by the Receiving Party without use of or reference to the Disclosing Party's Confidential Information.

## 5. Term and Termination

The obligations of this Agreement shall survive for a period of five (5) years from the Effective Date.

## 6. Governing Law

This Agreement shall be governed by and construed in accordance with the laws of the State of [State], without regard to its conflict of laws principles.

---

**IN WITNESS WHEREOF,** the Parties have executed this Agreement as of the Effective Date.

**Party A:**
Signature: _________________________
Name:
Title:

**Party B:**
Signature: _________________________
Name:
Title:
`,
    'marketing-brief-01': `
# Creative Marketing Brief: [Campaign Name]

**Date:** ${new Date().toLocaleDateString()}
**Project Lead:** [Your Name]
**Team:** [Marketing, Design, etc.]

---

## 1. Background & Objective

**What is the project?** Briefly describe the campaign and what we are trying to achieve. What is the single most important goal?
(e.g., Launch the new "DocuMind Pro" subscription tier and drive 1,000 new sign-ups in Q3.)

## 2. Target Audience

Describe the primary audience for this campaign in detail.
- **Demographics:** (Age, location, profession, etc.)
- **Psychographics:** (Interests, values, pain points, motivations.)
- **What do they currently think/feel/do?**
- **What do we want them to think/feel/do after this campaign?**

## 3. Key Message & Value Proposition

**What is the single most important message we need to communicate?** This should be a concise, compelling statement that resonates with our target audience.
(e.g., "Stop fighting with documents. Start collaborating intelligently with DocuMind Pro.")

**Supporting Points:**
- Point 1: (e.g., Save hours with AI-powered summarization.)
- Point 2: (e.g., Collaborate in real-time with your entire team.)
- Point 3: (e.g., Ensure compliance with automated legal and policy checks.)

## 4. Call to Action (CTA)

What specific action do we want the audience to take?
(e.g., "Start Your 14-Day Free Trial," "Request a Demo," "Download the Whitepaper")

## 5. Deliverables & Channels

List all the assets that need to be created and where they will be distributed.
- **Deliverables:** (e.g., Landing page, 3x social media ads, 1x blog post, email campaign.)
- **Channels:** (e.g., LinkedIn, Twitter, Google Ads, Company Blog, Email Newsletter.)

## 6. Timeline & Key Dates

- **Launch Date:** [Date]
- **Creative Review:** [Date]
- **Final Assets Due:** [Date]

## 7. Budget

Total approved budget for this campaign: **$[Amount]**

---

**Approval:**
[Name], [Title]
`,
};

export function getTemplateContent(templateId: string): string {
  return templateContents[templateId] || '';
}
