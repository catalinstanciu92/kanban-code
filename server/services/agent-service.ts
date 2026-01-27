import { mkdir, access, readFile, writeFile, unlink, readdir } from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'
import type { Agent, CreateAgentInput, UpdateAgentInput, AgentTools } from '../types/index.js'

export class AgentService {
  private basePath: string

  constructor(basePath: string = '.opencode/agents') {
    this.basePath = basePath
  }

  async folderExists(): Promise<boolean> {
    try {
      await access(this.basePath)
      return true
    } catch {
      return false
    }
  }

  async ensureFolder(): Promise<void> {
    await mkdir(this.basePath, { recursive: true })
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  private getFilePath(name: string): string {
    return path.join(this.basePath, `${name}.md`)
  }

  private parseAgent(content: string): Partial<Agent> & { body: string } {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
    
    if (!frontmatterMatch) {
      return { body: content }
    }

    const [, frontmatterStr, body] = frontmatterMatch
    const frontmatter = yaml.load(frontmatterStr) as Record<string, unknown>
    
    return {
      name: frontmatter.name as string,
      description: frontmatter.description as string,
      mode: frontmatter.mode as 'subagent' | 'agent',
      temperature: frontmatter.temperature as number,
      model: frontmatter.model as string,
      tools: frontmatter.tools as AgentTools,
      body: body.trim(),
    }
  }

  private formatAgent(agent: Agent): string {
    const frontmatter = {
      name: agent.name,
      description: agent.description,
      mode: agent.mode,
      temperature: agent.temperature,
      model: agent.model,
      tools: agent.tools,
    }

    const yamlStr = yaml.dump(frontmatter, { lineWidth: -1 })
    return `---\n${yamlStr}---\n\n${agent.body}`
  }

  async listAgents(): Promise<Agent[]> {
    const exists = await this.folderExists()
    if (!exists) {
      return []
    }

    const entries = await readdir(this.basePath)
    const agents: Agent[] = []

    for (const entry of entries) {
      if (!entry.endsWith('.md')) continue
      
      const filePath = path.join(this.basePath, entry)
      const content = await readFile(filePath, 'utf-8')
      const parsed = this.parseAgent(content)
      
      if (parsed.name && parsed.description && parsed.mode) {
        agents.push({
          name: parsed.name,
          description: parsed.description,
          mode: parsed.mode,
          temperature: parsed.temperature ?? 0.7,
          model: parsed.model ?? 'gpt-4',
          tools: parsed.tools ?? {},
          body: parsed.body ?? '',
        })
      }
    }

    return agents
  }

  async getAgent(name: string): Promise<Agent | null> {
    const filePath = this.getFilePath(name)
    
    try {
      const content = await readFile(filePath, 'utf-8')
      const parsed = this.parseAgent(content)
      
      if (!parsed.name) {
        return null
      }

      return {
        name: parsed.name,
        description: parsed.description ?? '',
        mode: parsed.mode ?? 'subagent',
        temperature: parsed.temperature ?? 0.7,
        model: parsed.model ?? 'gpt-4',
        tools: parsed.tools ?? {},
        body: parsed.body ?? '',
      }
    } catch {
      return null
    }
  }

  async createAgent(input: CreateAgentInput): Promise<Agent> {
    const exists = await this.folderExists()
    if (!exists) {
      await this.ensureFolder()
    }

    const slugName = this.slugify(input.name)
    
    const agent: Agent = {
      name: input.name,
      description: input.description,
      mode: input.mode,
      temperature: input.temperature,
      model: input.model,
      tools: input.tools,
      body: input.body,
    }

    const filePath = this.getFilePath(slugName)
    const content = this.formatAgent(agent)
    await writeFile(filePath, content, 'utf-8')

    return agent
  }

  async updateAgent(name: string, updates: UpdateAgentInput): Promise<Agent | null> {
    const existing = await this.getAgent(name)
    if (!existing) {
      return null
    }

    const newName = (updates as { name?: string }).name ?? existing.name
    
    const updated: Agent = {
      ...existing,
      ...updates,
      name: newName,
    }

    const filePath = this.getFilePath(name)
    const content = this.formatAgent(updated)
    await writeFile(filePath, content, 'utf-8')

    if (newName !== name) {
      const newFilePath = this.getFilePath(this.slugify(newName))
      await unlink(filePath)
      await writeFile(newFilePath, content, 'utf-8')
    }

    return updated
  }

  async deleteAgent(name: string): Promise<boolean> {
    const filePath = this.getFilePath(name)
    
    try {
      await unlink(filePath)
      return true
    } catch {
      return false
    }
  }
}
