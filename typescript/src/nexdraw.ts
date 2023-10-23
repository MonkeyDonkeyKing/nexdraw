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
            "the emperor account that will be updated"
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
          "isSigner": true,
          "docs": [
            "The current authority of the emperor account"
          ]
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "emperor",
      "docs": [
        "The program manager is the user that is allowed to create lottery managers"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "refers to the user that was assigned the authority of the program manager"
            ],
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
            "the emperor account that will be updated"
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
          "isSigner": true,
          "docs": [
            "The current authority of the emperor account"
          ]
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "emperor",
      "docs": [
        "The program manager is the user that is allowed to create lottery managers"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "refers to the user that was assigned the authority of the program manager"
            ],
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
