from pydantic import BaseModel, Field
from typing import List, Optional, Union

class PlayApp(BaseModel):
    """
    Detailed information about an application from Google Play.
    """
    app_name: str = Field(..., title="App Name", description="The display name of the application", example="Facebook")
    package: str = Field(..., title="Package ID", description="The unique Android package identifier", example="com.facebook.katana")
    developer: str = Field(..., title="Developer Name", description="The name of the app developer", example="Meta Platforms, Inc.")
    developer_id: Optional[str] = Field(None, title="Developer ID", description="Unique identifier for the developer")
    developer_email: Optional[str] = Field(None, title="Developer Email", description="Contact email for the developer")
    score: Optional[float] = Field(0, title="Rating", description="The average user rating of the app", example=4.5)
    ratings: Optional[int] = Field(0, title="Ratings Count", description="The number of user ratings")
    installs: Optional[str] = Field(None, title="Installs", description="Approximate number of installs", example="5,000,000,000+")
    genre: Optional[str] = Field(None, title="Genre/Category", description="The category the app belongs to", example="Social")
    description: Optional[str] = Field(None, title="Description", description="The full description of the app from the store")
    icon: Optional[str] = Field(None, title="Icon URL", description="Large icon URL for the app")
    version: Optional[str] = Field(None, title="Version", description="The current version string")
    updated: Optional[Union[int, str]] = Field(None, title="Last Updated", description="Timestamp or date string of the last update")
    android_version: Optional[str] = Field(None, title="Android Version", description="Required Android version")
    content_rating: Optional[str] = Field(None, title="Content Rating", description="Age rating for the app content")
    released: Optional[str] = Field(None, title="Release Date", description="Original release date string")
    permissions: Optional[List[str]] = Field([], title="Permissions", description="List of Android permissions requested by the app")
    source: str = Field(..., title="Data Source", description="The store where this data was retrieved from", example="google play")
    link: Optional[str] = Field(None, title="Store Link", description="The URL to the app page on the store")

class LookalikeResult(BaseModel):
    """
    Result of a look-alike analysis, including risk assessment and similarity metrics.
    """
    app_name: str = Field(..., title="App Name", description="The display name of the potentially impersonating app")
    link: str = Field(..., title="Store Link", description="URL to the app on its respective store")
    source: str = Field(..., title="Data Source", description="The store source (e.g., apkpure, aptoide, huawei)")
    risk_score: float = Field(..., title="Risk Score", description="Calculated risk score from 0.0 to 100.0", example=75.5)
    similarity: float = Field(..., title="Similarity Score", description="Semantic similarity to the target app (0.0 to 1.0)", example=0.85)
    reasons: List[str] = Field(..., title="Analysis Reasons", description="Human-readable reasons for the assigned risk score")
    is_suspicious: bool = Field(..., title="Is Suspicious?", description="Boolean flag indicating if the app has suspicious signals or represents a potential risk")
    package: Optional[str] = Field(None, title="Package ID", description="The package identifier for the app")
    developer: Optional[str] = Field(None, title="Developer", description="The developer name if available")
    sha256: Optional[str] = Field(None, title="SHA256", description="The file hash of the APK if available")
    icon: Optional[str] = Field(None, title="Icon URL", description="The application icon URL")
    version: Optional[str] = Field(None, title="Version", description="The app version string")
    score: Optional[float] = Field(None, title="User Rating", description="The average user rating on the source store")
    installs: Optional[str] = Field(None, title="Installs", description="Number of installs on the source store")
    updated: Optional[Union[int, str]] = Field(None, title="Last Updated", description="Last update date or timestamp")
    appid: Optional[str] = Field(None, title="App ID", description="Internal store ID for the app")
    md5: Optional[str] = Field(None, title="MD5 Hash", description="File MD5 hash if available")
    released: Optional[str] = Field(None, title="Release Date", description="Original release date")
    is_official: Optional[bool] = Field(False, title="Is Official?", description="Flag indicating if this is considered the official version of the app")

class KoodousResult(BaseModel):
    """
    Malware analysis result from the Koodous APK database.
    """
    id: Union[int, str] = Field(..., title="Koodous ID", description="Unique identifier in the Koodous database")
    app: str = Field(..., title="App Name", description="Name of the application")
    package_name: str = Field(..., title="Package Name", description="Android package identifier")
    sha256: str = Field(..., title="SHA256", description="SHA256 hash of the APK")
    image: Optional[str] = Field(None, title="Image URL", description="URL to the application icon or image")
    is_detected: Optional[bool] = Field(False, title="Is Detected?", description="Flag indicating if the app is detected as malware")
    tags: List[str] = Field([], title="Tags", description="Tags associated with the APK")
