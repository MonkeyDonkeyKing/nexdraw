export type Nexdraw = {
  "version": "0.0.1",
  "name": "nexdraw",
  "instructions": [
    {
      "name": "initializeEmperor",
      "docs": [
        "Creates the global owner of the program",
        "Only the emperor can create lottery managers"
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
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
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
            "name": "emperorCommission",
            "type": "u64"
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
    }
  ]
};

export const IDL: Nexdraw = {
  "version": "0.0.1",
  "name": "nexdraw",
  "instructions": [
    {
      "name": "initializeEmperor",
      "docs": [
        "Creates the global owner of the program",
        "Only the emperor can create lottery managers"
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
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
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
            "name": "emperorCommission",
            "type": "u64"
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
    }
  ]
};
