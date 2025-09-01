localStorage.setItem("projevo_boqs", JSON.stringify([
  {
    "id": 1,
    "title": "Test Construction BOQ",
    "createdAt": "2025-01-10T10:00:00.000Z",
    "updatedAt": "2025-01-10T10:00:00.000Z",
    "tahapanKerja": [
      {
        "id": 1,
        "name": "Foundation Work",
        "jenisKerja": [
          {
            "id": 2,
            "name": "Excavation",
            "uraian": [
              {
                "id": 3,
                "name": "Site Excavation",
                "spec": [
                  {
                    "id": 4,
                    "description": "Manual excavation for foundation",
                    "satuan": "m3",
                    "volume": 50,
                    "pricePerPcs": 150000
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": 5,
        "name": "Structure Work",
        "jenisKerja": [
          {
            "id": 6,
            "name": "Concrete Work",
            "uraian": [
              {
                "id": 7,
                "name": "Foundation Concrete",
                "spec": [
                  {
                    "id": 8,
                    "description": "K-300 concrete for foundation",
                    "satuan": "m3",
                    "volume": 30,
                    "pricePerPcs": 800000
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]));
console.log("Test BOQ data added to localStorage");
