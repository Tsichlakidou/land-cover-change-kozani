# Land Cover Change Analysis in Kozani (2000–2018)

Satellite-based land cover classification and change detection for the Kozani region (Greece), using **Google Earth Engine (JavaScript)** and map finalization in **QGIS**.

---

## Project Overview
The project analyzes land cover changes between 2000 and 2018 using Corine Land Cover data.  
CLC classes were grouped into 9 main land cover categories and thematic maps were produced.

---

## Data
- Corine Land Cover (CLC) 2000
- Corine Land Cover (CLC) 2018
- Region of interest: Kozani, Greece
- Training points for classification

---

## Methodology
1. Import land cover datasets into Google Earth Engine
2. Reclassify detailed CLC classes into 9 major categories
3. Generate classified maps for 2000 and 2018
4. Compute change detection
5. Export results
6. Final map visualization in QGIS

---

## Results (summary)
- Urban areas increased
- Agricultural areas decreased
- Vegetation and water body changes observed

---

## How to run
This script is designed for the **Google Earth Engine Code Editor**.

Required assets:
- ROI geometry
- CLC 2000
- CLC 2018
- Training points

These must exist in your GEE Assets.

---

## Tools & Technologies
- Google Earth Engine (JavaScript)
- QGIS
- Remote Sensing / GIS analysis

---

## Author
Paraskevi Tsichlakidou  
Electrical & Computer Engineering (BSc + Integrated MSc)
