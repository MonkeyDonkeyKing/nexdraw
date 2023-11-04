export type Nexdraw = {
  "version": "0.0.1",
  "name": "nexdraw",
  "constants": [
    {
      "name": "MAX_PERCENTAGE",
      "type": "u16",
      "value": "1000"
    },
    {
      "name": "ONE_YEAR_IN_SECONDS",
      "type": "i64",
      "value": "31_536_000"
    },
    {
      "name": "PERCENTAGE_PRECISION",
      "type": "u16",
      "value": "10_000"
    }
  ],
  "instructions": [
    {
      "name": "initializeEmperor",
      "docs": [
        "Creates the global owner of the program",
        "Only the emperor can create draw managers"
      ],
      "accounts": [
        {
          "name": "emperor",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "emperor"
              }
            ]
          }
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateEmperor",
      "docs": [
        "Updates the authority of the emperor account",
        "Only the current emperor can update the authority"
      ],
      "accounts": [
        {
          "name": "emperor",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Auto derived below.",
            "////////////////////////////////////////////////////////////////////////"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "emperor"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "createDrawRegent",
      "docs": [
        "Creates a new draw regent account",
        "Only the emperor can create draw regents"
      ],
      "accounts": [
        {
          "name": "emperor",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "emperor"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "drawRegent",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "draw_regent"
              },
              {
                "kind": "arg",
                "type": "publicKey",
                "path": "regent_key"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "regentKey",
          "type": "publicKey"
        },
        {
          "name": "drawsLeft",
          "type": "u32"
        },
        {
          "name": "commission",
          "type": "u16"
        }
      ]
    },
    {
      "name": "updateDrawRegent",
      "docs": [
        "Updates the draw regent account",
        "Only the emperor can update draw regents"
      ],
      "accounts": [
        {
          "name": "drawRegent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "emperor",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "emperor"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "drawsRemaining",
          "type": {
            "option": "u32"
          }
        },
        {
          "name": "newEmperorCommission",
          "type": {
            "option": "u16"
          }
        }
      ]
    },
    {
      "name": "createTimedSolDraw",
      "docs": [
        "Creates a new timed solana ticketprice draw",
        "Only the draw regent can create lotteries"
      ],
      "accounts": [
        {
          "name": "draw",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "draw"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "DrawRegent",
                "path": "draw_regent"
              },
              {
                "kind": "account",
                "type": "u32",
                "account": "DrawRegent",
                "path": "draw_regent.next_draw_id"
              }
            ]
          }
        },
        {
          "name": "drawManager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "drawRegent",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "draw_regent"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "draw_manager"
              }
            ]
          },
          "relations": [
            "draw_manager"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "timedParams",
          "type": {
            "defined": "TimedParams"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "draw",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "manager",
            "docs": [
              "The pubkey of the draw manager."
            ],
            "type": "publicKey"
          },
          {
            "name": "drawId",
            "docs": [
              "The id of the draw."
            ],
            "type": "u32"
          },
          {
            "name": "drawInfo",
            "docs": [
              "Info about the draw."
            ],
            "type": {
              "defined": "DrawInfo"
            }
          },
          {
            "name": "ticketInfo",
            "docs": [
              "The info about the tickets,"
            ],
            "type": {
              "defined": "TicketInfo"
            }
          },
          {
            "name": "winners",
            "type": {
              "defined": "Winners"
            }
          },
          {
            "name": "reserved",
            "docs": [
              "Unused reservfe byte space for future changes"
            ],
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "drawRegent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "drawManager",
            "type": "publicKey"
          },
          {
            "name": "nextDrawId",
            "type": "u32"
          },
          {
            "name": "drawsRemaining",
            "type": "u32"
          },
          {
            "name": "emperorPercentCommission",
            "docs": [
              "decimal percentage representation of the commission"
            ],
            "type": "u16"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                70
              ]
            }
          }
        ]
      }
    },
    {
      "name": "emperor",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                320
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Capped",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "maximumDuration",
            "type": "i64"
          },
          {
            "name": "ticketCap",
            "type": "u32"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                124
              ]
            }
          }
        ]
      }
    },
    {
      "name": "DrawInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "drawType",
            "type": {
              "defined": "DrawType"
            }
          },
          {
            "name": "status",
            "type": {
              "defined": "DrawStatus"
            }
          },
          {
            "name": "drawingStatus",
            "type": {
              "option": {
                "defined": "DrawingStatus"
              }
            }
          },
          {
            "name": "cancelStatus",
            "type": {
              "option": {
                "defined": "CancelStatus"
              }
            }
          },
          {
            "name": "prizes",
            "type": {
              "defined": "Prizes"
            }
          }
        ]
      }
    },
    {
      "name": "Prizes",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "prizes",
            "type": {
              "vec": {
                "defined": "Prize"
              }
            }
          }
        ]
      }
    },
    {
      "name": "TicketInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": {
              "defined": "TicketPrice"
            }
          },
          {
            "name": "sold",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "Timed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "minTicketsSold",
            "docs": [
              "this variable will always default to the length of the prizes array at launch"
            ],
            "type": "u32"
          },
          {
            "name": "ticketsForSale",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                112
              ]
            }
          },
          {
            "name": "reserved2",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          }
        ]
      }
    },
    {
      "name": "TimedParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "minTicketsSold",
            "type": "u32"
          },
          {
            "name": "ticketsForSale",
            "type": {
              "option": "u32"
            }
          }
        ]
      }
    },
    {
      "name": "Winner",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ticketId",
            "type": "u32"
          },
          {
            "name": "claimed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "Winners",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "winners",
            "type": {
              "vec": {
                "defined": "Winner"
              }
            }
          }
        ]
      }
    },
    {
      "name": "PercentageHandler",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "value",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "Prize",
      "docs": [
        "Size of the prize enum is interpreted as the size of the largest variant",
        "(in this case, FixedAsset)",
        "1 + 16 + 32"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Percentage",
            "fields": [
              {
                "name": "value",
                "type": "u16"
              }
            ]
          },
          {
            "name": "Nft",
            "fields": [
              {
                "name": "mint",
                "type": "publicKey"
              }
            ]
          },
          {
            "name": "FixedAsset",
            "fields": [
              {
                "name": "mint",
                "type": "publicKey"
              },
              {
                "name": "value",
                "type": "u64"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "TicketPrice",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Sol",
            "fields": [
              {
                "name": "value",
                "type": "u64"
              }
            ]
          },
          {
            "name": "Spl",
            "fields": [
              {
                "name": "mint",
                "type": "publicKey"
              },
              {
                "name": "value",
                "type": "u64"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "DrawStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Concepting"
          },
          {
            "name": "Live"
          },
          {
            "name": "Drawing"
          },
          {
            "name": "Claim"
          },
          {
            "name": "Finalized"
          },
          {
            "name": "Canceled"
          }
        ]
      }
    },
    {
      "name": "DrawingStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Progressing",
            "fields": [
              {
                "name": "index",
                "type": "u32"
              }
            ]
          },
          {
            "name": "Incomplete",
            "fields": [
              {
                "name": "cleaned",
                "type": "bool"
              }
            ]
          },
          {
            "name": "Done"
          }
        ]
      }
    },
    {
      "name": "CancelStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Refunding",
            "fields": [
              {
                "name": "tickets",
                "type": "u32"
              }
            ]
          },
          {
            "name": "Done"
          }
        ]
      }
    },
    {
      "name": "DrawType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Capped",
            "fields": [
              {
                "defined": "Capped"
              }
            ]
          },
          {
            "name": "Timed",
            "fields": [
              {
                "defined": "Timed"
              }
            ]
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAuthority",
      "msg": "invalid authority provided"
    },
    {
      "code": 6001,
      "name": "InvalidPercentage",
      "msg": "invalid percentage provided"
    },
    {
      "code": 6002,
      "name": "ElapsedEndTime"
    },
    {
      "code": 6003,
      "name": "EndTimeExceedsOneYear"
    },
    {
      "code": 6004,
      "name": "DurationisZero"
    },
    {
      "code": 6005,
      "name": "MinTicketsIsZero"
    },
    {
      "code": 6006,
      "name": "MinMaxTicketsCrossOver"
    },
    {
      "code": 6007,
      "name": "NoNftDuplicates"
    }
  ]
};

export const IDL: Nexdraw = {
  "version": "0.0.1",
  "name": "nexdraw",
  "constants": [
    {
      "name": "MAX_PERCENTAGE",
      "type": "u16",
      "value": "1000"
    },
    {
      "name": "ONE_YEAR_IN_SECONDS",
      "type": "i64",
      "value": "31_536_000"
    },
    {
      "name": "PERCENTAGE_PRECISION",
      "type": "u16",
      "value": "10_000"
    }
  ],
  "instructions": [
    {
      "name": "initializeEmperor",
      "docs": [
        "Creates the global owner of the program",
        "Only the emperor can create draw managers"
      ],
      "accounts": [
        {
          "name": "emperor",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "emperor"
              }
            ]
          }
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateEmperor",
      "docs": [
        "Updates the authority of the emperor account",
        "Only the current emperor can update the authority"
      ],
      "accounts": [
        {
          "name": "emperor",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Auto derived below.",
            "////////////////////////////////////////////////////////////////////////"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "emperor"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "createDrawRegent",
      "docs": [
        "Creates a new draw regent account",
        "Only the emperor can create draw regents"
      ],
      "accounts": [
        {
          "name": "emperor",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "emperor"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "drawRegent",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "draw_regent"
              },
              {
                "kind": "arg",
                "type": "publicKey",
                "path": "regent_key"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "regentKey",
          "type": "publicKey"
        },
        {
          "name": "drawsLeft",
          "type": "u32"
        },
        {
          "name": "commission",
          "type": "u16"
        }
      ]
    },
    {
      "name": "updateDrawRegent",
      "docs": [
        "Updates the draw regent account",
        "Only the emperor can update draw regents"
      ],
      "accounts": [
        {
          "name": "drawRegent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "emperor",
          "isMut": false,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "emperor"
              }
            ]
          },
          "relations": [
            "authority"
          ]
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "drawsRemaining",
          "type": {
            "option": "u32"
          }
        },
        {
          "name": "newEmperorCommission",
          "type": {
            "option": "u16"
          }
        }
      ]
    },
    {
      "name": "createTimedSolDraw",
      "docs": [
        "Creates a new timed solana ticketprice draw",
        "Only the draw regent can create lotteries"
      ],
      "accounts": [
        {
          "name": "draw",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "draw"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "account": "DrawRegent",
                "path": "draw_regent"
              },
              {
                "kind": "account",
                "type": "u32",
                "account": "DrawRegent",
                "path": "draw_regent.next_draw_id"
              }
            ]
          }
        },
        {
          "name": "drawManager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "drawRegent",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "draw_regent"
              },
              {
                "kind": "account",
                "type": "publicKey",
                "path": "draw_manager"
              }
            ]
          },
          "relations": [
            "draw_manager"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "timedParams",
          "type": {
            "defined": "TimedParams"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "draw",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "manager",
            "docs": [
              "The pubkey of the draw manager."
            ],
            "type": "publicKey"
          },
          {
            "name": "drawId",
            "docs": [
              "The id of the draw."
            ],
            "type": "u32"
          },
          {
            "name": "drawInfo",
            "docs": [
              "Info about the draw."
            ],
            "type": {
              "defined": "DrawInfo"
            }
          },
          {
            "name": "ticketInfo",
            "docs": [
              "The info about the tickets,"
            ],
            "type": {
              "defined": "TicketInfo"
            }
          },
          {
            "name": "winners",
            "type": {
              "defined": "Winners"
            }
          },
          {
            "name": "reserved",
            "docs": [
              "Unused reservfe byte space for future changes"
            ],
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "drawRegent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "drawManager",
            "type": "publicKey"
          },
          {
            "name": "nextDrawId",
            "type": "u32"
          },
          {
            "name": "drawsRemaining",
            "type": "u32"
          },
          {
            "name": "emperorPercentCommission",
            "docs": [
              "decimal percentage representation of the commission"
            ],
            "type": "u16"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                70
              ]
            }
          }
        ]
      }
    },
    {
      "name": "emperor",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                320
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Capped",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "maximumDuration",
            "type": "i64"
          },
          {
            "name": "ticketCap",
            "type": "u32"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                124
              ]
            }
          }
        ]
      }
    },
    {
      "name": "DrawInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "drawType",
            "type": {
              "defined": "DrawType"
            }
          },
          {
            "name": "status",
            "type": {
              "defined": "DrawStatus"
            }
          },
          {
            "name": "drawingStatus",
            "type": {
              "option": {
                "defined": "DrawingStatus"
              }
            }
          },
          {
            "name": "cancelStatus",
            "type": {
              "option": {
                "defined": "CancelStatus"
              }
            }
          },
          {
            "name": "prizes",
            "type": {
              "defined": "Prizes"
            }
          }
        ]
      }
    },
    {
      "name": "Prizes",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "prizes",
            "type": {
              "vec": {
                "defined": "Prize"
              }
            }
          }
        ]
      }
    },
    {
      "name": "TicketInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": {
              "defined": "TicketPrice"
            }
          },
          {
            "name": "sold",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "Timed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "minTicketsSold",
            "docs": [
              "this variable will always default to the length of the prizes array at launch"
            ],
            "type": "u32"
          },
          {
            "name": "ticketsForSale",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                112
              ]
            }
          },
          {
            "name": "reserved2",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          }
        ]
      }
    },
    {
      "name": "TimedParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "minTicketsSold",
            "type": "u32"
          },
          {
            "name": "ticketsForSale",
            "type": {
              "option": "u32"
            }
          }
        ]
      }
    },
    {
      "name": "Winner",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ticketId",
            "type": "u32"
          },
          {
            "name": "claimed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "Winners",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "winners",
            "type": {
              "vec": {
                "defined": "Winner"
              }
            }
          }
        ]
      }
    },
    {
      "name": "PercentageHandler",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "value",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "Prize",
      "docs": [
        "Size of the prize enum is interpreted as the size of the largest variant",
        "(in this case, FixedAsset)",
        "1 + 16 + 32"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Percentage",
            "fields": [
              {
                "name": "value",
                "type": "u16"
              }
            ]
          },
          {
            "name": "Nft",
            "fields": [
              {
                "name": "mint",
                "type": "publicKey"
              }
            ]
          },
          {
            "name": "FixedAsset",
            "fields": [
              {
                "name": "mint",
                "type": "publicKey"
              },
              {
                "name": "value",
                "type": "u64"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "TicketPrice",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Sol",
            "fields": [
              {
                "name": "value",
                "type": "u64"
              }
            ]
          },
          {
            "name": "Spl",
            "fields": [
              {
                "name": "mint",
                "type": "publicKey"
              },
              {
                "name": "value",
                "type": "u64"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "DrawStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Concepting"
          },
          {
            "name": "Live"
          },
          {
            "name": "Drawing"
          },
          {
            "name": "Claim"
          },
          {
            "name": "Finalized"
          },
          {
            "name": "Canceled"
          }
        ]
      }
    },
    {
      "name": "DrawingStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Progressing",
            "fields": [
              {
                "name": "index",
                "type": "u32"
              }
            ]
          },
          {
            "name": "Incomplete",
            "fields": [
              {
                "name": "cleaned",
                "type": "bool"
              }
            ]
          },
          {
            "name": "Done"
          }
        ]
      }
    },
    {
      "name": "CancelStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Refunding",
            "fields": [
              {
                "name": "tickets",
                "type": "u32"
              }
            ]
          },
          {
            "name": "Done"
          }
        ]
      }
    },
    {
      "name": "DrawType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Capped",
            "fields": [
              {
                "defined": "Capped"
              }
            ]
          },
          {
            "name": "Timed",
            "fields": [
              {
                "defined": "Timed"
              }
            ]
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAuthority",
      "msg": "invalid authority provided"
    },
    {
      "code": 6001,
      "name": "InvalidPercentage",
      "msg": "invalid percentage provided"
    },
    {
      "code": 6002,
      "name": "ElapsedEndTime"
    },
    {
      "code": 6003,
      "name": "EndTimeExceedsOneYear"
    },
    {
      "code": 6004,
      "name": "DurationisZero"
    },
    {
      "code": 6005,
      "name": "MinTicketsIsZero"
    },
    {
      "code": 6006,
      "name": "MinMaxTicketsCrossOver"
    },
    {
      "code": 6007,
      "name": "NoNftDuplicates"
    }
  ]
};
