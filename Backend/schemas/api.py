from pydantic import BaseModel, Field
from typing import List, Union
from .app import PlayApp, LookalikeResult, KoodousResult

class AppSearchResponse(BaseModel):
    """
    Standard response for application search queries.
    """
    results: List[Union[PlayApp, LookalikeResult, KoodousResult, dict]] = Field(..., title="Search Results", description="List of applications matching the search criteria")

class KoodousSearchResponse(BaseModel):
    """
    Response schema for Koodous malware intelligence search.
    """
    results: List[KoodousResult] = Field(..., title="Koodous Results")

class AnalyzeProgress(BaseModel):
    """
    Real-time progress update for the analysis task.
    """
    progress: int = Field(..., title="Progress Percentage", description="Current completion percentage (0-100)", example=45)
    step: str = Field(..., title="Current Step", description="Description of the current analysis phase", example="Scanning Google Play...")

class AnalyzeResultsPayload(BaseModel):
    """
    Categorized analysis results from various sources.
    """
    google_play: List[LookalikeResult] = Field([], title="Google Play Results")
    apple_app_store: List[LookalikeResult] = Field([], title="Apple App Store Results")
    apkpure: List[LookalikeResult] = Field([], title="APKPure Results")
    aptoide: List[LookalikeResult] = Field([], title="Aptoide Results")
    huawei: List[LookalikeResult] = Field([], title="Huawei AppGallery Results")
    search_engine: List[LookalikeResult] = Field([], title="Search Engine Results")

class AnalyzeResponse(BaseModel):
    """
    Final overall response for the look-alike analysis.
    """
    results: AnalyzeResultsPayload = Field(..., title="Aggregated Results", description="Grouped results of identified look-alike applications")
