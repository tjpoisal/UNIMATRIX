"""
Simple Unimatrix REST API Client (Python)

Use this when your LLM or agent doesn't support MCP.
"""

import os
import requests
from typing import List, Optional, Dict, Any

class UnimatrixClient:
    def __init__(self, api_key: str, base_url: str = "https://deployunimatrix.com/api"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    def _request(self, method: str, path: str, **kwargs) -> Any:
        url = f"{self.base_url}{path}"
        resp = requests.request(method, url, headers=self.headers, **kwargs)
        resp.raise_for_status()
        return resp.json()

    # Palaces
    def list_palaces(self) -> List[Dict]:
        return self._request("GET", "/palaces")

    def create_palace(self, name: str, description: Optional[str] = None) -> Dict:
        return self._request("POST", "/palaces", json={"name": name, "description": description})

    def get_palace(self, palace_id: str) -> Dict:
        return self._request("GET", f"/palaces/{palace_id}")

    # Memories
    def store_memory(self, location_id: str, content: str, tags: List[str] = None) -> Dict:
        return self._request("POST", "/memories", json={
            "locationId": location_id,
            "content": content,
            "tags": tags or []
        })

    def search_memories(self, query: str, palace_id: Optional[str] = None, limit: int = 20) -> Dict:
        params = {"q": query, "limit": limit}
        if palace_id:
            params["palaceId"] = palace_id
        return self._request("GET", "/search", params=params)

    def list_memories(self, location_id: str) -> Dict:
        return self._request("GET", "/memories", params={"locationId": location_id})

    # Convenience method
    def get_recent_context(self, palace_id: str, limit: int = 10) -> List[Dict]:
        palace = self.get_palace(palace_id)
        memories = []
        
        def collect(locations):
            for loc in locations:
                if loc.get("memories"):
                    memories.extend(loc["memories"])
                if loc.get("children"):
                    collect(loc["children"])
        
        if palace.get("locations"):
            collect(palace["locations"])
        
        memories.sort(key=lambda m: m.get("createdAt", ""), reverse=True)
        return memories[:limit]

    def delete_memory(self, memory_id: str) -> Dict:
        return self._request("DELETE", f"/memories/{memory_id}")

    def list_locations(self, palace_id: str) -> List[Dict]:
        palace = self.get_palace(palace_id)
        return palace.get("locations", [])

    def create_location(self, palace_id: str, name: str, description: Optional[str] = None, parent_id: Optional[str] = None) -> Dict:
        return self._request("POST", "/locations", json={
            "palaceId": palace_id,
            "name": name,
            "description": description,
            "parentId": parent_id,
        })

    def export_all(self) -> Dict:
        return self._request("GET", "/export")


# Example usage
if __name__ == "__main__":
    client = UnimatrixClient(os.environ["UNIMATRIX_API_KEY"])
    results = client.search_memories("authentication architecture")
    print(results)
